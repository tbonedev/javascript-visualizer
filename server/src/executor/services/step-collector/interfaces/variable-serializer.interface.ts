import inspector from 'inspector';

export interface IVariableSerializerService {
  /**
   * Serialize RemoteObject in to JavaScript value
   */
  serialize(remoteObject: inspector.Runtime.RemoteObject): Promise<unknown>;
  /**
   * Gets properties of object by objectId
   */
  getProperties(
    objectId: string,
  ): Promise<Array<{ name: string; value: unknown }>>;

  reset(): void;
}
