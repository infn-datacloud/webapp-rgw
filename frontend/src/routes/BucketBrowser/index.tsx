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
import { getTableData, uploadFiles, deleteObjects, listObjects } from './services';
import { NewPathModal } from './NewPathModal';
import { PathViewer } from './PathViewer';


type PropsType = {
  bucketName: string
}

export const BucketBrowser = ({ bucketName }: PropsType) => {
  const [bucketObjects, setBucketObjects] = useState<BucketObject[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("/");
  const s3 = useS3Service();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>();
  const lockRef = useRef<boolean>(false);

  const columns: Column[] = [
    { id: "icon" },
    { id: "name", name: "Name" },
    { id: "last_modified", name: "Last Modified" },
    { id: "bucket_size", name: "Size" },
  ];

  let visibleObjects = bucketObjects.filter(el => {
    if (el.Key) {
      const abspath = '/' + el.Key;
      return abspath.startsWith(currentPath);
    }
    return false;
  });
  console.log("Current path is:", currentPath, visibleObjects);

  let tableData = getTableData(visibleObjects, currentPath);

  const refreshBucketObjects = useCallback(() => {
    const f = async () => {
      listObjects(s3, bucketName)
        .then(contents => {
          if (contents) {
            setBucketObjects(contents);
          } else {
            console.warn("Warning: bucket looks empty.");
          }
        })
        .catch(err => console.error(err));
    };
    f();
  }, [s3, bucketName]);


  useEffect(() => {
    if (bucketObjects.length === 0 && !lockRef.current) {
      refreshBucketObjects()
    }
    return () => {
      lockRef.current = true;
    }
  }, [bucketObjects, s3, refreshBucketObjects])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    inputRef.current = e.target;
    const { files } = e.target;

    const prefix = currentPath[0] === '/' ? currentPath.slice(1) : currentPath;
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
    const newState = new Set(selectedRows);
    if (el.target.checked) {
      newState.add(index);
    } else {
      newState.delete(index);
    }
    setSelectedRows(newState);
  }

  const onClick = (_: MouseEvent<HTMLTableRowElement>, index: number) => {
    const { Key } = visibleObjects[index];
    if (Key) {
      const abspath = '/' + Key;
      let path = abspath;
      if (currentPath !== '/') {
        path = path.replace(new RegExp(`^${currentPath}`), "");
      }
      const isFolder = path.split('/').length > 2;
      if (isFolder) {
        const child = path.split("/")[1];
        const newPath = currentPath === '/' ? '/' + child : currentPath + '/' + child;
        setCurrentPath(newPath);
        setSelectedRows(new Set());
        return;
      }
    }

    const newState = new Set([index]);
    setSelectedRows(newState);
  }

  const deleteSelectedObjects = () => {

    const toDelete = Array.from(selectedRows).map((rowIndex: number) => {
      return bucketObjects[rowIndex];
    });

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
    if (newPath !== currentPath) {
      console.log("Set new path", newPath);
      setCurrentPath(newPath);
    }
  }

  interface PathBackButtonProps {
    className?: string
  }
  const PathBackButton = ({ className }: PathBackButtonProps) => {
    return (
      <div className={className}>
        <button className="w-8 h-8 p-[5px] text-neutral-500 hover:bg-neutral-200 rounded-full"
          onClick={() => {
            const pathArgs = currentPath.split('/');
            pathArgs.pop();
            if (pathArgs.length > 1) {
              setCurrentPath(pathArgs.join('/'));
            } else {
              setCurrentPath("/");
            }
            setSelectedRows(new Set());
          }}>
          <ChevronLeftIcon />
        </button>
      </div>
    )
  }

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
        currentPath={currentPath}
        onClose={handleModalClose}
      />
      {/* Inspector */}
      <div className='top-0 fixed z-10 right-0 w-64 bg-slate-300'>
        <BucketInspector
          isOpen={selectedRows.size > 0}
          bucket={bucketName}
          objects={Array.from(selectedRows).map(index => visibleObjects[index])}
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
            <PathBackButton className='my-auto' />
            <PathViewer
              className='my-auto'
              path={currentPath}
              prefix={bucketName}
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
