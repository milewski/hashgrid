import { BackgroundState } from './Hashgrid'

export type KeyModifiers = 'ctrl' | 'alt' | 'shift'

export interface StorageInterface {
    read(key: string): StorageData | null
    write(key: string, value: StorageData): StorageData
    remove(key: string): StorageData | null
}

export interface StorageData {
    gridNumber: number,
    overlayHold: boolean,
    overlayZIndex: BackgroundState
}

export interface OptionsInterface {
    id: string
    modifierKey: KeyModifiers,
    showGridKey: string,
    holdGridKey: string,
    foregroundKey: string,
    jumpGridsKey: string,
    numberOfGrids: number,
    classPrefix: string,
    storagePrefix: string,
    overlayZBG: number,
    overlayZFG: number
}

export interface StateInterface {
    overlayHold: boolean,
    overlayOn: boolean,
    overlayZIndex: BackgroundState,
    isKeyDown: { [key: string]: boolean },
    gridNumber: number
}
