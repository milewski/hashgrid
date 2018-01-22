import { KeyModifiers, OptionsInterface, StateInterface, StorageData } from './Interfaces'
import { SimpleStorage } from './SimpleStorage'

export enum BackgroundState {
    Background = 1,
    Foreground
}

export class Hashgrid {

    private storage: SimpleStorage
    private overlay: HTMLDivElement

    private options: OptionsInterface = {
        id: 'hashgrid',
        modifierKey: null,
        showGridKey: 'g',
        holdGridKey: 'h',
        foregroundKey: 'f',
        jumpGridsKey: 'j',
        numberOfGrids: 2,
        classPrefix: 'hashgrid',
        storagePrefix: 'hashgrid',
        overlayZBG: -1,
        overlayZFG: 9999
    }

    private state: StateInterface = {
        overlayHold: false,
        overlayOn: false,
        overlayZIndex: BackgroundState.Background,
        isKeyDown: {},
        gridNumber: 1
    }

    private listeners: { [key: string]: (KeyboardEvent) => void } = {
        keydown: null, keyup: null
    }

    constructor(options: OptionsInterface) {
        this.options = { ...this.options, ...options }
        this.storage = new SimpleStorage()
    }

    public init() {

        this.overlay = document.createElement('div')
        this.overlay.id = this.options.id
        this.overlay.classList.add(this.options.classPrefix + this.state.gridNumber)
        this.overlay.style.display = 'none'
        this.overlay.style.pointerEvents = 'none'
        this.overlay.style.height = document.body.scrollHeight + 'px'

        document.body.insertBefore(this.overlay, document.body.firstChild)

        document.addEventListener('keydown', this.listeners.keydown = event => this.keydownHandler(event), false)
        document.addEventListener('keyup', this.listeners.keydown = event => this.keyupHandler(event), false)

        setTimeout(() => this.createGrid())

        const storageData = this.storage.read(this.options.storagePrefix + this.options.id)

        if (storageData) {

            if (storageData.gridNumber) {
                this.overlay.classList.remove(this.options.classPrefix + this.state.gridNumber)
                this.overlay.classList.add(this.options.classPrefix + storageData.gridNumber)
                this.state.gridNumber = storageData.gridNumber
            }

            if (storageData.overlayHold) {
                this.overlay.style.display = 'block'
                this.state.overlayOn = true
                this.state.overlayHold = true
            }

            if (storageData.overlayZIndex) {

                if (storageData.overlayZIndex === BackgroundState.Background) {
                    this.overlay.style.zIndex = this.options.overlayZBG.toString()
                }

                if (storageData.overlayZIndex === BackgroundState.Foreground) {
                    this.overlay.style.zIndex = this.options.overlayZFG.toString()
                }

                this.state.overlayZIndex = storageData.overlayZIndex

            }
        }

    }

    private getKey({ keyCode }: KeyboardEvent): string {

        const codes = { '13': 'enter', '16': 'shift', '17': 'ctrl', '18': 'alt' }

        return codes[ keyCode ] ? codes[ keyCode ] : String.fromCharCode(keyCode).toLowerCase()

    }

    private getKeyModifier(event: KeyboardEvent, modifier: KeyModifiers = null): boolean {

        if (modifier === null) return true

        return [ 'ctrl', 'alt', 'shift' ].some(key => key === modifier ? event[ key + 'Key' ] : false)

    }

    private showOverlay() {
        this.overlay.style.display = 'block'
        this.state.overlayOn = true
    }

    private hideOverlay() {
        this.overlay.style.display = 'none'
        this.state.overlayOn = false
    }

    private destroy() {
        this.overlay.remove()
        this.storage.remove(this.options.storagePrefix + this.options.id)
        document.removeEventListener('keydown', this.listeners.keydown)
        document.removeEventListener('keyup', this.listeners.keyup)
    }

    private createGrid() {

        const rowContainer = document.createElement('div')
        const row = document.createElement('div')
        const columnContainer = document.createElement('div')
        const column = document.createElement('div')

        rowContainer.classList.add(this.options.id + '-row-container')
        columnContainer.classList.add(this.options.id + '-column-container')

        this.overlay.appendChild(rowContainer)
        this.overlay.appendChild(columnContainer)

        row.classList.add(this.options.id + '__row')
        column.classList.add(this.options.id + '__column')

        rowContainer.appendChild(row)
        columnContainer.appendChild(column)

        this.overlay.style.display = 'block'

        const overlayHeight = this.overlay.scrollHeight
        const overlayWidth = this.overlay.scrollWidth

        const rowHeight = row.getBoundingClientRect().height
        const columnWidth = column.getBoundingClientRect().width

        this.overlay.style.display = 'none'

        if (!rowHeight && !columnWidth) {
            return false
        }

        const grid = {
            row: {
                element: row,
                container: rowContainer,
                dimensions: [ rowHeight, overlayHeight ]
            },
            column: {
                element: column,
                container: columnContainer,
                dimensions: [ columnWidth, overlayWidth ]
            }
        }

        Object.keys(grid).forEach(key => {

            const { container, element, dimensions } = grid[ key ]

            container.appendChild(
                this.generateGrid(key, element, dimensions)
            )

        })

    }

    private generateGrid(key: string, element: HTMLElement, [ elementHeight, totalHeight ]: number[]): DocumentFragment {

        const fragment = document.createDocumentFragment()

        let count = Math.floor(totalHeight / elementHeight) - 1

        while (count--) {

            const clone = element.cloneNode() as HTMLDivElement

            clone.classList.add(this.options.id + '__' + key)

            fragment.appendChild(clone)

        }

        return fragment

    }

    private keydownHandler(event: KeyboardEvent) {

        const source = (event.target as HTMLElement).tagName.toLowerCase()

        /**
         * Don't show grid if you are typing for example on form inputs
         */
        if ([ 'input', 'textarea', 'select' ].some(element => element === source)) {
            return
        }

        if (!this.getKeyModifier(event, this.options.modifierKey)) {
            return true
        }

        const key = this.getKey(event)

        if (this.state.isKeyDown[ key ]) {
            return
        }

        this.state.isKeyDown[ key ] = true

        if (key === this.options.showGridKey) {

            if (!this.state.overlayOn) {
                this.showOverlay()
            }

            if (this.state.overlayHold) {
                this.hideOverlay()
                this.state.overlayHold = false
                this.storage.write(this.options.storagePrefix + this.options.id, this.createStorageData())
            }

        }

        if (key === this.options.holdGridKey && this.state.overlayOn && !this.state.overlayHold) {
            this.state.overlayHold = true
            this.storage.write(this.options.storagePrefix + this.options.id, this.createStorageData())
        }

        if (key === this.options.foregroundKey && this.state.overlayOn) {

            if (this.overlay.style.zIndex === this.options.overlayZFG.toString()) {
                this.overlay.style.zIndex = this.options.overlayZBG.toString()
                this.state.overlayZIndex = BackgroundState.Background
            } else {
                this.overlay.style.zIndex = this.options.overlayZFG.toString()
                this.state.overlayZIndex = BackgroundState.Foreground
            }

            this.storage.write(this.options.storagePrefix + this.options.id, this.createStorageData())

        }

        if (key === this.options.jumpGridsKey && this.state.overlayOn && this.options.numberOfGrids > 1) {

            this.overlay.classList.remove(this.options.classPrefix + this.state.gridNumber)
            this.state.gridNumber += 1

            if (this.state.gridNumber > this.options.numberOfGrids) {
                this.state.gridNumber = 1
            }

            this.overlay.classList.add(this.options.classPrefix + this.state.gridNumber)
            this.showOverlay()

            this.storage.write(this.options.storagePrefix + this.options.id, this.createStorageData())

        }

    }

    private keyupHandler(event: KeyboardEvent) {

        if (!this.getKeyModifier(event)) {
            return
        }

        const key = this.getKey(event)

        delete this.state.isKeyDown[ key ]

        if (key === this.options.showGridKey && !this.state.overlayHold) {
            this.hideOverlay()
        }

    }

    private createStorageData(): StorageData {
        return {
            gridNumber: this.state.gridNumber,
            overlayHold: this.state.overlayHold,
            overlayZIndex: this.state.overlayZIndex
        }
    }

}
