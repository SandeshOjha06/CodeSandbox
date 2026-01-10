export interface File {
  id: string;
  name: string;
  language: string;
  createdAt: Date;
  content: string;
}

export interface FileMap {
  [fileId: string]: File;
}

export interface PlaygroundWithFiles {
  id: string;
  userId: string;           
  title: string;
  activeFileId: string | null;
  files: FileMap;
  createdAt: Date;
  updatedAt: Date;
}