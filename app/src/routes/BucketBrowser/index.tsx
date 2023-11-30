import { ChangeEvent, MouseEvent, useCallback, useEffect, useMemo, useRef, useReducer } from 'react';
import { BucketObject, BucketObjectWithProgress, FileObjectWithProgress } from '../../models/bucket';
import { Column, Table } from '../../components/Table';
import { Button } from '../../components/Button';
import { BucketInspector } from '../../components/BucketInspector';
import {
  ArrowUpOnSquareIcon,
  ChevronLeftIcon,
  FolderIcon,
  HomeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useS3 } from '../../services/S3';
import { InputFile } from '../../components/InputFile';
import {
  initNodePathTree,
  getTableData,
} from './services';
import { NewPathModal } from './NewPathModal';
import { PathViewer } from './PathViewer';
import { NodePath, camelToWords, extractPathAndBasename } from '../../commons/utils';
import { NotificationType, useNotifications } from '../../services/Notifications';
import { ProgressBar } from "../../components/ProgressBar";
import { DownloadStatusPopup } from '../../components/DownloadStatusPopup';
import { SearchFiled } from '../../components/SearchField';
import { ArrowUturnRightIcon } from '@heroicons/react/24/solid';
import { Modal } from '../../components/Modal';
import { useBucketStore } from '../../services/BucketStore';
import { initialState, reducer } from './reducer';

const columns: Column[] = [
  { id: "icon" },
  { id: "name", name: "Name" },
  { id: "last_modified", name: "Last Modified" },
  { id: "bucket_size", name: "Size" },
];

interface PathBackButtonProps {
  className?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

const PathBackButton = ({ className, onClick }: PathBackButtonProps) => {
  return (
    <div className={className}>
      <button className="w-8 h-8 p-[5px] text-neutral-500 hover:bg-neutral-200 rounded-full"
        onClick={onClick}
      >
        <ChevronLeftIcon />
      </button>
    </div>
  )
}

type PropsType = {
  bucketName: string
}

export const BucketBrowser = ({ bucketName }: PropsType) => {
  const MAX_DOWNLOADABLE_ITEMS = 10;
  const { notify } = useNotifications();
  const { uploadObject, deleteObject, getPresignedUrl } = useS3();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const bucketStore = useBucketStore();

  const inputRef = useRef<HTMLInputElement>();
  const selectedObjects = useRef<Map<string, BucketObject>>(new Map());
  const componentDidMount = useRef(false);
  const toUpload = useRef<FileObjectWithProgress[]>([]);
  const toDownload = useRef<BucketObjectWithProgress[]>([]);

  const {
    currentPath,
    selectedRows,
    showModal,
    showAlert,
    downloadingObjects,
    uploadingObjects
  } = state;

  const bucketObjects: BucketObject[] = useMemo(() => {
    const objects = bucketStore.objects.get(bucketName) ?? [];
    return objects.reduce((acc: BucketObject[], el) => {
      if (el.Key) {
        acc.push({
          Key: el.Key,
          LastModified: el.LastModified ? new Date(el.LastModified) : undefined,
          ETag: el.ETag,
          Size: el.Size
        });
      }
      return acc;
    }, []);
  }, [bucketName, bucketStore.objects])

  const nodeTree = useMemo(() => {
    return initNodePathTree(bucketObjects);
  }, [bucketObjects]);


  useEffect(() => {
    if (!componentDidMount.current) {
      let previousPath: NodePath<BucketObject> | undefined;
      // we are not at the tree's root
      if (currentPath.parent) {
        previousPath = nodeTree.get(currentPath.path);
      }
      const newPath = previousPath ?? nodeTree
      dispatch({ type: "SET_CURRENT_PATH", nodePath: newPath });
      componentDidMount.current = true;
    }
    return (() => {
      componentDidMount.current = false;
    });
  }, [nodeTree, currentPath]);


  const onSelect = (checked: boolean, index: number) => {
    const objectName = Array.from(currentPath.children.values())[index].basename;
    const next = currentPath.get(objectName);
    if (!next) {
      throw new Error(`Child with name ${objectName} not found.`);
    }
    const isDir = next.children.size > 0;
    const elements = isDir ? next.getAll() : [next];
    const select = (n: NodePath<BucketObject>) => {
      if (n.value) {
        selectedObjects.current.set(n.path, n.value);
      }
    }
    const deselect = (n: NodePath<BucketObject>) => {
      selectedObjects.current.delete(n.path);
    }
    const strategy = checked ? select : deselect;
    elements.forEach(strategy);
    if (checked) {
      selectedRows.add(index);
    } else {
      selectedRows.delete(index);
    }
    dispatch({ type: "SELECT_ROWS", selectedRows });
  }

  const onClick = (index: number) => {
    const objectName = Array.from(currentPath.children.values())[index].basename;

    if (!objectName) {
      throw new Error("Object name is undefined");
    }

    if (selectedRows.has(index)) {
      selectedRows.delete(index);
      selectedObjects.current = new Map(
        Object.entries(selectedObjects.current)
          .filter(([key]) => key.startsWith(objectName)));
      dispatch({ type: "SELECT_ROWS", selectedRows });
      return;
    }

    const next = currentPath.get(objectName);
    if (!next) {
      throw new Error(`Child with name ${objectName} not found.`);
    }
    const isDir = next.children.size > 0;

    if (isDir) {
      dispatch({ type: "SET_CURRENT_PATH", nodePath: next });
    } else {
      // By default, deselect all
      selectedRows.clear();
      selectedObjects.current.clear();
      // If selected row was not selected, select it now
      if (!selectedRows.has(index) && next.value) {
        selectedRows.add(index);
        selectedObjects.current.set(next.path, next.value);
      }
      dispatch({ type: "SELECT_ROWS", selectedRows });
    }
  }

  const deleteSelectedObjects = async () => {
    const toDelete = Array.from(selectedObjects.current.values());
    // Queue all delete asynchronously
    await Promise.all(toDelete.map(o => {
      const { Key } = o;
      deleteObject(bucketName, Key);
      console.log(`Object with key ${Key} deleted.`);
    }))
    dispatch({ type: "DESELECT_ALL" });
    bucketStore.updateStore();
  }

  const uploadFiles = async () => {
    try {
      await Promise.all(toUpload.current.map(o =>
        uploadObject(bucketName, o, handleUploadsUpdates))
      );
      notify("File(s) uploaded", undefined, NotificationType.success);
      if (inputRef.current) {
        inputRef.current.files = null;
        inputRef.current.value = "";
      }
      bucketStore.updateStore();
    } catch (err) {
      if (err instanceof Error) {
        notify("Cannot upload file(s)", camelToWords(err.name),
          NotificationType.error);
      }
      (err: Error) => notify("Cannot upload file", camelToWords(err.name),
        NotificationType.error);
    }
  }

  const handleModalClose = (newPath: string) => {
    dispatch({ type: "HIDE_MODAL" });
    if (newPath && newPath !== currentPath.basename) {
      const [path, basename] = extractPathAndBasename(newPath);
      const newNode = new NodePath<BucketObject>(basename)
      currentPath.addChild(newNode, path)
      dispatch({ type: "SET_CURRENT_PATH", nodePath: newNode });
    }
  }

  const handleBucketInspectorClose = () => {
    selectedObjects.current.clear();
    selectedObjects.current.clear();
    dispatch({ type: "DESELECT_ALL" });
  }

  const handleDownloadFiles = async () => {
    if (selectedObjects.current.size > MAX_DOWNLOADABLE_ITEMS) {
      dispatch({ type: "SHOW_TOO_MANY_DOWNLOAD_ALERT" });
      return;
    }
    try {
      toDownload.current = Array.from(selectedObjects.current.values())
        .map(el => new BucketObjectWithProgress(el));
      const keys = toDownload.current.map(el => el.object.Key);
      const urlPromises = toDownload.current.map(el => {
        return getPresignedUrl(bucketName, el.object.Key);
      });

      const results = await Promise.all(urlPromises);
      const urls = results.map((url, i) => {
        return { key: keys[i], url: url };
      });

      const link = document.createElement("a");
      link.onclick = () => {
        urls.map(el => window.open(el.url, "_blank"));
      }
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      selectedObjects.current.clear();
      dispatch({ type: "DESELECT_ALL" });
    } catch (err) {
      if (err instanceof Error) {
        notify("Cannot download file(s)", camelToWords(err.name),
          NotificationType.error);
      } else {
        console.error(err);
      }
    }
  }

  const handleSelectFilesToUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    inputRef.current = e.target;
    const { files } = e.target;
    const n_files = files.length;

    toUpload.current = [];
    for (let i = 0; i < n_files; ++i) {
      const node = new NodePath<BucketObject>(
        files[i].name,
        { Key: files[i].name }
      );
      currentPath.addChild(node);
      toUpload.current.push(
        new FileObjectWithProgress({ Key: node.path }, files[i]));
    }
    uploadFiles();
  }

  const handleUploadsUpdates = () => {
    const t = [...toUpload.current];
    dispatch({ type: "UPLOADING", uploadingObjects: t })
  }

  const handleCloseDownloadPopup = () => {
    dispatch({ type: "DOWNLOADING", downloadingObjects: [] })
    toDownload.current = [];    // TODO: not sure about this
  }

  const handleCloseUploadPopup = () => {
    dispatch({ type: "UPLOADING", uploadingObjects: [] })
    toUpload.current = [];      // TODO: not sure about this
  }

  const goBack = useCallback(() => {
    const newPath: NodePath<BucketObject> = currentPath.parent ?
      currentPath.parent : nodeTree
    // No file was uploaded, remove the path
    if (currentPath.children.size === 0) {
      newPath.removeChild(currentPath);
    }
    selectedObjects.current = new Map();
    dispatch({ type: "SET_CURRENT_PATH", nodePath: newPath });
  }, [nodeTree, currentPath]);

  const handleSearchQuery = (query: string) => {
    let objects = bucketObjects;
    if (query) {
      objects = objects.filter(o => o.Key.toLowerCase().includes(query));
    }
    const nodePath = initNodePathTree(objects);
    dispatch({ type: "SET_CURRENT_PATH", nodePath })
  }

  const TooManyDownloadsAlert = () => {
    return (
      <Modal open={showAlert} >
        <div className='p-4'>
          <p className='text-xl font-bold'>Warning</p>
          <p className='mt-4'>
            {`Too many file selected for downloading. Please select maximum ` +
              `${MAX_DOWNLOADABLE_ITEMS} objects or less.`}
          </p>
          <div className='flex justify-end'>
            <Button
              className="w-24"
              title="OK"
              onClick={() => dispatch({ type: "HIDE_TOO_MANY_DOWNLOAD_ALERT" })}
            />
          </div>
        </div>
      </Modal>
    )
  }

  const tableData = getTableData(currentPath);

  return (
    <>
      <NewPathModal
        open={showModal}
        prefix={bucketName + '/'}
        currentPath={currentPath.path}
        onClose={handleModalClose}
      />
      <TooManyDownloadsAlert />
      {/* Inspector */}
      <div
        // id="inspector-container"
        className='top-0 fixed z-10 right-0 w-64 bg-slate-300'
      >
        <BucketInspector
          isOpen={selectedObjects.current.size > 0}
          objects={Array.from(selectedObjects.current.values())}
          onClose={handleBucketInspectorClose}
          onDownload={handleDownloadFiles}
          onDelete={deleteSelectedObjects}
        />
      </div>
      {/* Transition to open the right drawer */}
      <div className={`w-full transition-all ease-in-out duration-200 
        ${selectedRows.size > 0 ? "mr-72" : "mr-0"}`}>
        <div className='container'>
          {/* Buttons */}
          <div className="flex mt-8 place-content-between">
            <div className='flex space-x-4'>
              <Button
                title="Home"
                icon={<HomeIcon />}
                onClick={() => navigate(-1)}
              />
              <InputFile
                icon={<ArrowUpOnSquareIcon />}
                onChange={handleSelectFilesToUpload}
              />
              <Button
                title="Refresh"
                icon={<ArrowUturnRightIcon />}
                onClick={() => bucketStore.updateStore()}
              />
            </div>
            <div className='flex space-x-4'>
              <Button
                title="New path"
                icon={<FolderIcon />}
                onClick={() => dispatch({ type: "SHOW_MODAL" })}
              />
              <Button
                title="Delete file(s)"
                icon={<TrashIcon />}
                onClick={deleteSelectedObjects}
                disabled={selectedRows.size === 0}
              />
            </div>
          </div>
          {/* PathViewer */}
          <div className='flex mt-8 justify-between'>
            <div className="flex space-x-4">
              <PathBackButton className='my-auto' onClick={goBack} />
              <PathViewer
                className='my-auto'
                path={currentPath.path}
                prefix={bucketName + '/'}
              />
            </div>
            <div className="flex space-x-4 mt-4 justify-end">
              <SearchFiled onChange={(query => handleSearchQuery(query))} />
            </div>
          </div>
          {/* Table */}
          <div className="flex place-content-center mt-4">
            <Table
              selectable={true}
              columns={columns}
              data={tableData}
              onSelect={onSelect}
              onClick={onClick}
              selectedRows={selectedRows}
            />
          </div>
        </div>
      </div>
      {/* Downloads */}
      <DownloadStatusPopup
        show={downloadingObjects.length > 0}
        onClose={handleCloseDownloadPopup}
      >
        {downloadingObjects.map(el => {
          return <ProgressBar
            key={el.object.Key!}
            title={el.object.Key!}
            value={el.progress}
          />
        })}
      </DownloadStatusPopup>
      {/* Uploads */}
      <DownloadStatusPopup
        show={uploadingObjects.length > 0}
        onClose={handleCloseUploadPopup}
        upload={true}
      >
        {uploadingObjects.map(el => {
          return <ProgressBar
            key={el.object.Key!}
            title={el.object.Key!}
            value={el.progress}
          />
        })}
      </DownloadStatusPopup>
    </>
  )
}
