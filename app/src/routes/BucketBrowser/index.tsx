import { ChangeEvent, MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { BucketObject, BucketObjectWithProgress, FileObjectWithProgress } from '../../models/bucket';
import { Column, Table } from '../../components/Table';
import { Button } from '../../components/Button';
import { BucketInspector } from '../../components/BucketInspector';
import {
  ArrowLeftIcon,
  ArrowUpOnSquareIcon,
  ChevronLeftIcon,
  FolderIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useS3 } from '../../services/S3';
import { InputFile } from '../../components/InputFile';
import {
  initNodePathTree,
  getTableData,
  downloadFiles,
  uploadFiles,
  deleteObjects,
  listObjects
} from './services';
import { NewPathModal } from './NewPathModal';
import { PathViewer } from './PathViewer';
import { NodePath, camelToWords } from '../../commons/utils';
import { NotificationType, useNotifications } from '../../services/Notifications';
import { ProgressBar } from "../../components/ProgressBar";
import { DownloadStatusPopup } from '../../components/DownloadStatusPopup';
import { SearchFiled } from '../../components/SearchField';
import { ArrowUturnRightIcon } from '@heroicons/react/24/solid';
import { Modal } from '../../components/Modal';

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
  const bucketObjects = useRef<BucketObject[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(new NodePath<BucketObject>(""));
  const s3 = useS3();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>();
  const lockRef = useRef<boolean>(false);
  const rootNodeRef = useRef<NodePath<BucketObject>>(new NodePath(""));
  const selectedObjects = useRef<Map<string, BucketObject>>(new Map());
  const toDownload = useRef<BucketObjectWithProgress[]>([]);
  const toUpload = useRef<FileObjectWithProgress[]>([]);
  const [downloading, setDownloading] = useState<BucketObjectWithProgress[]>([]);
  const [uploading, setUploading] = useState<BucketObjectWithProgress[]>([]);
  const [showTooManyObjectsAlert, setShowTooManyObjectsAlert] = useState(false);
  const { notify } = useNotifications();

  const restorePreviousPath = useCallback(() => {
    // If a node different than root was set, set it back
    if (currentPath.path != "") {
      const allFiles = rootNodeRef.current.getAll();
      for (const file of allFiles) {
        if (file.parent && file.parent.path == currentPath.path) {
          setCurrentPath(file.parent);
          return;
        }
      }
    }
    // Otherwise, set current path to root
    setCurrentPath(rootNodeRef.current);
  }, [currentPath.path]);

  const refreshBucketObjects = useCallback(() => {
    const f = async () => {
      listObjects(s3, bucketName)
        .then(contents => {
          if (contents) {
            rootNodeRef.current = new NodePath("");
            bucketObjects.current = contents.reduce((acc: BucketObject[], el) => {
              if (el.Key) {
                acc.push({
                  Key: el.Key,
                  LastModified: el.LastModified ? new Date(el.LastModified) : undefined,
                  ETag: el.ETag,
                  Size: el.Size
                });
              }
              return acc;
            }, [])
            initNodePathTree(bucketObjects.current, rootNodeRef.current);
            restorePreviousPath();
          } else {
            rootNodeRef.current = new NodePath("");
            setCurrentPath(rootNodeRef.current);
          }
        })
        .catch((err) => {
          console.error(err);
          if (err instanceof Error) {
            notify("Cannot fetch bucket content",
              camelToWords(err.name), NotificationType.error)
          }
        });
    };
    f();
  }, [s3, bucketName, notify, restorePreviousPath]);


  useEffect(() => {
    if (!lockRef.current) {
      refreshBucketObjects()
    }
  }, [s3, refreshBucketObjects])


  const onSelect = (el: ChangeEvent<HTMLInputElement>, index: number) => {
    const { checked } = el.target;
    const objectName = Array.from(currentPath.children.values())[index].basename;
    const next = currentPath.get(objectName);
    if (!next) {
      throw new Error(`Child with name ${objectName} not found.`);
    }
    const isDir = next.children.size > 0;
    const newSelection = new Set(selectedRows);
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
      newSelection.add(index);
    } else {
      newSelection.delete(index);
    }
    setSelectedRows(newSelection);
  }

  const onClick = (event: MouseEvent<HTMLTableRowElement>, index: number) => {
    const { type } = (event.target as HTMLInputElement);
    if (type === "checkbox") {
      return;
    }
    const objectName = Array.from(currentPath.children.values())[index].basename;

    if (!objectName) {
      throw new Error("Object name is undefined");
    }

    if (selectedRows.has(index)) {
      const newState = new Set(selectedRows);
      newState.delete(index);
      selectedObjects.current = new Map(
        Object.entries(selectedObjects.current)
          .filter(([key]) => key.startsWith(objectName)));
      setSelectedRows(newState);
      return;
    }

    const next = currentPath.get(objectName);
    if (!next) {
      throw new Error(`Child with name ${objectName} not found.`);
    }
    const isDir = next.children.size > 0;

    if (isDir) {
      setCurrentPath(next);
    } else {
      // By default, deselect all
      const newState = new Set<number>();
      const newSelectedObjects = new Map();
      // If selected row was not selected, select it now
      if (!selectedRows.has(index) && next.value) {
        newState.add(index);
        newSelectedObjects.set(next.path, next.value);
      }
      selectedObjects.current = newSelectedObjects;
      setSelectedRows(newState);
    }
  }

  const deleteSelectedObjects = () => {
    const toDelete = Array.from(selectedObjects.current.values());
    // Queue all delete asynchronously
    deleteObjects(s3, bucketName, toDelete)
      .then(() => {
        selectedObjects.current = new Map();
        setSelectedRows(new Set());
        refreshBucketObjects();
      });
  }

  const createNewPath = () => {
    setModalOpen(true);
  }

  const handleModalClose = (newPath: string) => {
    setModalOpen(false);
    if (newPath !== currentPath.basename && newPath !== "") {
      const newNode = new NodePath<BucketObject>(newPath)
      currentPath.addChild(newNode)
      console.log("Set new path", newPath);
      setCurrentPath(newNode);
    }
  }

  const handleBucketInspectorClose = () => {
    selectedObjects.current = new Map();
    setSelectedRows(new Set());
  }

  const handleDownloadFiles = async () => {
    if (selectedObjects.current.size > MAX_DOWNLOADABLE_ITEMS) {
      setShowTooManyObjectsAlert(true);
      return;
    }

    try {
      toDownload.current = Array.from(selectedObjects.current.values())
        .map(el => new BucketObjectWithProgress(el));
      await downloadFiles(s3, bucketName, toDownload.current);
      selectedObjects.current = new Map();
      setSelectedRows(new Set());
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
    const path = currentPath.clone();

    for (let i = 0; i < n_files; ++i) {
      const node = new NodePath<BucketObject>(files[i].name, { Key: files[i].name });
      path.addChild(node);
      toUpload.current.push(
        new FileObjectWithProgress({ Key: node.path }, files[i]));
    }

    const startUpload = async () => {
      try {
        await uploadFiles(s3, bucketName, toUpload.current, handleUploadsUpdates)
        notify("File(s) uploaded", undefined, NotificationType.success);
        if (inputRef.current) {
          inputRef.current.files = null;
          inputRef.current.value = "";
          refreshBucketObjects();
        }
      } catch (err) {
        if (err instanceof Error) {
          notify("Cannot upload file(s)", camelToWords(err.name),
            NotificationType.error);
        }
        (err: Error) => notify("Cannot upload file", camelToWords(err.name),
          NotificationType.error);
      }
    }
    startUpload();
  }


  const handleUploadsUpdates = () => {
    const t = [...toUpload.current];
    setUploading(t);
  }

  const handleCloseDownloadPopup = () => {
    setDownloading([]);
    toDownload.current = [];    // TODO: not sure about this
  }

  const handleCloseUploadPopup = () => {
    setUploading([]);
    toUpload.current = [];      // TODO: not sure about this
  }

  const goBack = useCallback(() => {
    const newPath: NodePath<BucketObject> = currentPath.parent && currentPath.parent.basename !== "" ?
      currentPath.parent : rootNodeRef.current;

    // No file was uploaded, remove the path
    if (currentPath.children.size === 0) {
      newPath.removeChild(currentPath);
    }

    selectedObjects.current = new Map();
    setCurrentPath(newPath);
    setSelectedRows(new Set());
  }, [currentPath]);

  const handleSearchQuery = (query: string) => {
    let objects: BucketObject[] = [];
    if (query) {
      objects = bucketObjects.current.filter(o => o.Key.toLowerCase().includes(query));
    } else {
      objects = bucketObjects.current;
    }
    rootNodeRef.current = new NodePath("");
    initNodePathTree(objects, rootNodeRef.current);
    restorePreviousPath();
  }

  const TooManyDownloadsAlert = () => {
    return (
      <Modal
        open={showTooManyObjectsAlert}
      >
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
              onClick={() => setShowTooManyObjectsAlert(false)}
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
        open={modalOpen}
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
                title="Back"
                icon={<ArrowLeftIcon />}
                onClick={() => navigate(-1)}
              />
              <InputFile
                icon={<ArrowUpOnSquareIcon />}
                onChange={handleSelectFilesToUpload}
              />
              <Button
                title="Refresh"
                icon={<ArrowUturnRightIcon />}
                onClick={() => refreshBucketObjects()}
              />
            </div>
            <div className='flex space-x-4'>
              <Button
                title="New path"
                icon={<FolderIcon />}
                onClick={createNewPath}
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
        show={downloading.length > 0}
        onClose={handleCloseDownloadPopup}
      >
        {downloading.map(el => {
          return <ProgressBar
            key={el.object.Key!}
            title={el.object.Key!}
            value={el.progress}
          />
        })}
      </DownloadStatusPopup>
      {/* Uploads */}
      <DownloadStatusPopup
        show={uploading.length > 0}
        onClose={handleCloseUploadPopup}
        upload={true}
      >
        {uploading.map(el => {
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
