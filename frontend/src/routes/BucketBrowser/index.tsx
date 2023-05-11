import { ChangeEvent, MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Page } from '../../components/Page';
import { BucketObject } from '../../models/bucket';
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
import { useS3Service } from '../../services/S3Service';
import { InputFile } from '../../components/InputFile';
import {
  initNodePathTree,
  getTableData,
  uploadFiles,
  deleteObjects,
  listObjects
} from './services';
import { NewPathModal } from './NewPathModal';
import { PathViewer } from './PathViewer';
import { NodePath } from '../../commons/utils';

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
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(new NodePath<BucketObject>(""));
  const s3 = useS3Service();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>();
  const lockRef = useRef<boolean>(false);
  const rootNodeRef = useRef<NodePath<BucketObject>>(new NodePath(""));
  const selectedObjects = useRef<Map<string, BucketObject>>(new Map());

  let tableData = getTableData(currentPath);
  console.log(selectedObjects.current);

  const refreshBucketObjects = useCallback(() => {
    const f = async () => {
      listObjects(s3, bucketName)
        .then(contents => {
          if (contents) {
            rootNodeRef.current = new NodePath("");
            initNodePathTree(contents, rootNodeRef.current);
            const allFiles = rootNodeRef.current.getAll();
            // Reset current path in the new tree
            for (const f of allFiles) {
              const { parent } = f;
              if (parent && parent.path === currentPath.path) {
                setCurrentPath(parent);
                return;
              }
            }
            // Otherwise, set current path to root
            setCurrentPath(rootNodeRef.current);
          } else {
            console.warn("Warning: bucket looks empty.");
          }
        })
        .catch(err => console.error(err));
    };
    f();
  }, [s3, bucketName, currentPath.path]);


  useEffect(() => {
    if (!lockRef.current) {
      refreshBucketObjects()
    }
    return () => {
      lockRef.current = true;
    }
  }, [s3, refreshBucketObjects])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    inputRef.current = e.target;
    const { files } = e.target;

    // Remove leading '/'
    const prefix = currentPath.path.replace(/^\//, "");
    uploadFiles(s3, bucketName, files, prefix)
      .then(() => {
        console.log("File(s) uploaded");
        if (inputRef.current) {
          inputRef.current.files = null;
          inputRef.current.value = "";
          refreshBucketObjects();
        }
      })
      .catch(err => console.error(err));
  }

  const onSelect = (el: ChangeEvent<HTMLInputElement>, index: number) => {
    const { checked } = el.target;
    const objectName = tableData[index][1]["value"];
    const next = currentPath.findChild(objectName);
    if (!next) {
      throw new Error(`Child with name ${objectName} not found.`);
    }
    const isDir = next.children.length > 0;
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
    const tableRow = event.currentTarget;
    const tableCell = tableRow.getElementsByClassName("name")[0];
    const objectName = tableCell.textContent;

    if (!objectName) {
      throw new Error("Object name is undefined");
    }

    const next = currentPath.findChild(objectName);
    if (!next) {
      throw new Error(`Child with name ${objectName} not found.`);
    }

    const isDir = next.children.length > 0;

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

  const goBack = useCallback(() => {
    const newPath = currentPath.parent && currentPath.parent.basename !== "" ?
      currentPath.parent : rootNodeRef.current;

    // No file was uploaded, remove the path
    if (currentPath.children.length === 0) {
      newPath.removeChild(currentPath);
    }

    selectedObjects.current = new Map();
    setCurrentPath(newPath);
    setSelectedRows(new Set());
  }, [currentPath]);

  return (
    <Page title={bucketName}>
      <Button
        title="Back"
        icon={<ArrowLeftIcon />}
        onClick={() => navigate(-1)}
      />
      <NewPathModal
        open={modalOpen}
        bucketName={bucketName}
        currentPath={currentPath.path}
        onClose={handleModalClose}
      />
      {/* Inspector */}
      <div className='top-0 fixed z-10 right-0 w-64 bg-slate-300'>
        <BucketInspector
          isOpen={selectedObjects.current.size > 0}
          bucket={bucketName}
          objects={Array.from(selectedObjects.current.values())}
        />
      </div>
      {/* Transition to open the right drawer */}
      <div className={`transition-all ease-in-out duration-200 ${selectedRows.size > 0 ? "mr-72" : "mr-0"}`}>
        <div className='container w-2/3'>
          {/* Buttons */}
          <div className="flex mt-8 place-content-between">
            <InputFile
              icon={<ArrowUpOnSquareIcon />}
              onChange={handleFileChange}
            />
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
          <div className='flex space-x-4 mt-8'>
            <PathBackButton className='my-auto' onClick={goBack} />
            <PathViewer
              className='my-auto'
              path={currentPath.path}
              prefix={bucketName + '/'}
            />
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

    </Page>
  )
}
