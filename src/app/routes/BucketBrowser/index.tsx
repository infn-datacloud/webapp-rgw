import {
  ChangeEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useReducer,
} from "react";
import { BucketObject, FileObjectWithProgress } from "../../models/bucket";
import { Table } from "../../components/Table";
import { Button } from "../../components/Button";
import { BucketInspector } from "../../components/BucketInspector";
import {
  ArrowUpOnSquareIcon,
  ChevronLeftIcon,
  FolderIcon,
  HomeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useS3 } from "../../services/S3";
import { InputFile } from "../../components/InputFile";
import { initNodePathTree } from "./services";
import { NewPathModal } from "./NewPathModal";
import { PathViewer } from "./PathViewer";
import {
  NodePath,
  camelToWords,
  extractPathAndBasename,
} from "../../commons/utils";
import {
  NotificationType,
  useNotifications,
} from "../../services/Notifications";
import { ProgressPopup } from "../../components/ProgressPopup";
import { SearchFiled } from "../../components/SearchField";
import { ArrowUturnRightIcon } from "@heroicons/react/24/solid";
import { Modal } from "../../components/Modal";
import { useBucketStore } from "../../services/BucketStore";
import { initialState, reducer } from "./reducer";

interface PathBackButtonProps {
  className?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

const PathBackButton = ({ className, onClick }: PathBackButtonProps) => {
  return (
    <div className={className}>
      <button
        className="w-8 h-8 p-[5px] text-neutral-500 hover:bg-neutral-200 rounded-full"
        onClick={onClick}
      >
        <ChevronLeftIcon />
      </button>
    </div>
  );
};

type PropsType = {
  bucketName: string;
};

export const BucketBrowser = ({ bucketName }: PropsType) => {
  const MAX_DOWNLOADABLE_ITEMS = 10;
  const { notify } = useNotifications();
  const { uploadObject, deleteObject, getPresignedUrl } = useS3();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const bucketStore = useBucketStore();
  const selectedObjects = useRef<Map<string, BucketObject>>(new Map());
  const tempPath = useRef<string | undefined>(undefined);

  const {
    tableData,
    selectedRows,
    currentPath,
    showModal,
    showAlert,
    objectsInProgress,
  } = state;

  const bucketObjects: BucketObject[] = useMemo(() => {
    const objects = bucketStore.objects.get(bucketName) ?? [];
    return objects.reduce((acc: BucketObject[], el) => {
      if (el.Key) {
        acc.push({
          Key: el.Key,
          LastModified: el.LastModified ? new Date(el.LastModified) : undefined,
          ETag: el.ETag,
          Size: el.Size,
        });
      }
      return acc;
    }, []);
  }, [bucketName, bucketStore.objects]);

  const nodeTree = useMemo(() => {
    return initNodePathTree(bucketObjects);
  }, [bucketObjects]);

  useEffect(() => {
    let nodePath = nodeTree;
    if (tempPath.current) {
      const t = nodeTree.get(tempPath.current);
      if (t) {
        nodePath = t;
      }
      tempPath.current = undefined;
    }
    dispatch({ type: "SET_CURRENT_PATH", nodePath });
  }, [nodeTree]);

  const onSelect = (checked: boolean, index: number) => {
    const objectName = Array.from(currentPath.children.values())[index]
      .basename;
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
    };
    const deselect = (n: NodePath<BucketObject>) => {
      selectedObjects.current.delete(n.path);
    };
    const strategy = checked ? select : deselect;
    elements.forEach(strategy);
    dispatch({ type: checked ? "SELECT_ROW" : "DESELECT_ROW", index });
  };

  const onClick = (index: number) => {
    const objectName = Array.from(currentPath.children.values())[index]
      .basename;

    if (!objectName) {
      throw new Error("Object name is undefined");
    }

    if (tableData.rows[index].selected) {
      selectedObjects.current = new Map(
        Object.entries(selectedObjects.current).filter(([key]) =>
          key.startsWith(objectName)
        )
      );
      dispatch({ type: "DESELECT_ROW", index });
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
      dispatch({ type: "SELECT_ROW", index });
    }
  };

  const deleteSelectedObjects = async () => {
    const toDelete = Array.from(selectedObjects.current.values());
    // Queue all delete asynchronously
    await Promise.all(
      toDelete.map(o => {
        const { Key } = o;
        deleteObject(bucketName, Key);
        console.log(`Object with key ${Key} deleted.`);
      })
    );
    dispatch({ type: "DESELECT_ALL" });
    bucketStore.updateStore();
  };

  const handleModalClose = (newPath: string) => {
    let nextPath = currentPath;
    if (newPath && newPath !== currentPath.basename) {
      const [path, basename] = extractPathAndBasename(newPath);
      const newNode = new NodePath<BucketObject>(basename);
      currentPath.addChild(newNode, path);
      nextPath = newNode;
      tempPath.current = newNode.path;
    }
    dispatch({ type: "HIDE_MODAL", nextPath });
  };

  const handleBucketInspectorClose = () => {
    selectedObjects.current.clear();
    selectedObjects.current.clear();
    dispatch({ type: "DESELECT_ALL" });
  };

  const handleDownloadFiles = async () => {
    if (selectedObjects.current.size > MAX_DOWNLOADABLE_ITEMS) {
      dispatch({ type: "SHOW_TOO_MANY_DOWNLOAD_ALERT" });
      return;
    }
    try {
      const toDownload = Array.from(selectedObjects.current.values());
      const keys = toDownload.map(object => object.Key);
      const promises = toDownload.map(o => getPresignedUrl(bucketName, o.Key));
      const urls = (await Promise.all(promises)).map((url, i) => {
        return { key: keys[i], url: url };
      });
      const link = document.createElement("a");
      link.onclick = () => {
        urls.map(el => window.open(el.url, "_blank"));
      };
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      selectedObjects.current.clear();
      dispatch({ type: "DESELECT_ALL" });
    } catch (err) {
      if (err instanceof Error) {
        notify(
          "Cannot download file(s)",
          camelToWords(err.name),
          NotificationType.error
        );
      } else {
        console.error(err);
      }
    }
  };

  // uploads
  const uploadFiles = async (files: FileObjectWithProgress[]) => {
    try {
      files.forEach(file => {
        const onUpdate = () => handleUploadsUpdates(file);
        const onComplete = () => handleUploadComplete(file);
        uploadObject(bucketName, file, onUpdate, onComplete);
      });
      dispatch({ type: "UPLOAD_STARTED", objects: files });
    } catch (e) {
      const msg = e instanceof Error ? camelToWords(e.name) : "Unknown Error";
      notify("Cannot upload file(s)", msg, NotificationType.error);
    }
  };

  const handleSelectFilesToUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) {
      return;
    }
    const { files } = e.target;
    const filesToUpload = new Array(files.length);
    const root = currentPath.path;
    for (let i = 0; i < files.length; ++i) {
      // avoid trailing slash if root is empty or "/"
      const Key = root.length > 1 ? `${root}/${files[i].name}` : files[i].name;
      filesToUpload[i] = new FileObjectWithProgress({ Key }, files[i]);
    }
    uploadFiles(filesToUpload);
  };

  const handleUploadsUpdates = (object: FileObjectWithProgress) => {
    if (object.progress < 1.0) {
      dispatch({ type: "UPLOAD_PROGRESS_UPDATED", object });
    }
  };

  const handleUploadComplete = (object: FileObjectWithProgress) => {
    dispatch({ type: "UPLOAD_COMPLETED", object });
    bucketStore.updateStore();
    if (state.objectsInProgress.size <= 1) {
      notify(
        "Upload Complete",
        "All files have been successfully uploaded",
        NotificationType.success
      );
    }
  };

  const goBack = useCallback(() => {
    const newPath: NodePath<BucketObject> = currentPath.parent
      ? currentPath.parent
      : nodeTree;
    // No file was uploaded, remove the path
    if (currentPath.children.size === 0) {
      newPath.removeChild(currentPath);
      tempPath.current = undefined;
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
    dispatch({ type: "SET_CURRENT_PATH", nodePath });
  };

  const TooManyDownloadsAlert = () => {
    return (
      <Modal open={showAlert}>
        <div className="p-4">
          <p className="text-xl font-bold">Warning</p>
          <p className="mt-4">
            {`Too many file selected for downloading. Please select maximum ` +
              `${MAX_DOWNLOADABLE_ITEMS} objects or less.`}
          </p>
          <div className="flex justify-end">
            <Button
              className="w-24"
              title="OK"
              onClick={() => dispatch({ type: "HIDE_TOO_MANY_DOWNLOAD_ALERT" })}
            />
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <>
      <NewPathModal
        open={showModal}
        prefix={bucketName + "/"}
        currentPath={currentPath.path}
        onClose={handleModalClose}
      />
      <TooManyDownloadsAlert />
      {/* Inspector */}
      <div
        // id="inspector-container"
        className="top-0 fixed z-10 right-0 w-64 bg-slate-300"
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
      <div
        className={`w-full transition-all ease-in-out duration-200 
        ${selectedRows > 0 ? "mr-72" : "mr-0"}`}
      >
        <div className="container">
          {/* Buttons */}
          <div className="flex mt-8 place-content-between">
            <div className="flex space-x-4">
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
            <div className="flex space-x-4">
              <Button
                title="New path"
                icon={<FolderIcon />}
                onClick={() => dispatch({ type: "SHOW_MODAL" })}
              />
              <Button
                title="Delete file(s)"
                icon={<TrashIcon />}
                onClick={deleteSelectedObjects}
                disabled={selectedRows === 0}
              />
            </div>
          </div>
          {/* PathViewer */}
          <div className="flex mt-8 justify-between">
            <div className="flex space-x-4">
              <PathBackButton className="my-auto" onClick={goBack} />
              <PathViewer
                className="my-auto"
                path={currentPath.path}
                prefix={bucketName + "/"}
              />
            </div>
            <div className="flex space-x-4 mt-4 justify-end">
              <SearchFiled onChange={query => handleSearchQuery(query)} />
            </div>
          </div>
          {/* Table */}
          <div className="flex place-content-center mt-4">
            <Table
              selectable={true}
              data={tableData}
              onSelect={onSelect}
              onClick={onClick}
            />
          </div>
        </div>
      </div>
      {/* Uploads */}
      <ProgressPopup
        title="Uploading"
        show={objectsInProgress.size > 0}
        progressList={[...objectsInProgress.values()].map(o => {
          const t = o.object.Key.split("/");
          return { title: t[t.length - 1], value: o.progress };
        })}
      />
    </>
  );
};
