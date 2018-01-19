import { StorageData, StorageInterface } from './Interfaces'

export class SimpleStorage implements StorageInterface {

    private storage: Storage

    constructor() {
        this.storage = localStorage || sessionStorage
    }

    public read(key: string): StorageData | null {

        const dataValue = this.storage.getItem(key)

        if (dataValue) {
            return JSON.parse(dataValue)
        }

        return null

    }

    public write(key: string, value: StorageData): StorageData {
        return this.storage.setItem(key, JSON.stringify(value)) || value
    }

    public remove(key: string): StorageData | null {

        const removedDataValue = this.read(key)

        if (removedDataValue) {
            return this.storage.removeItem(key) || removedDataValue
        }

        return null

    }

}
