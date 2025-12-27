export class Attachment {
  name: string;
  path: string | undefined;
  uri: string | undefined;
  type: string | undefined;
  mimeType: string | undefined;

  constructor(name: string, path?: string, uri?: string, type?: string, mimeType?: string) {
    this.name = name;
    this.path = path;
    this.uri = uri;
    this.type = type;
    this.mimeType = mimeType;
  }
}