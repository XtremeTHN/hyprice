import Service from "resource:///com/github/Aylur/ags/service.js";

// @ts-ignore
import Gio from 'gi://Gio';

/**
 * - This callback is called when mounting the device
 * @callback AsyncReadyCallback
 * @param {any} source_object
 * @param {any} response
 * @param {void} data
 * @returns {void}
 */

export class Disk extends Service {
    static {
        Service.register(
            this,
            {   
                'removed': [],
            },
            {
                'icon-name':['string'],
                'name': ['string'],
                'uuid': ['string'],
                'can_mount': ['boolean'],
                'is_mounted': ['boolean']
            }
        )
    }

    #vol=undefined
    #vol_icon=undefined
    #vol_name=undefined
    #vol_uuid=undefined
    #vol_can_mount=false
    #vol_is_mounted=false

    #cancellable=Gio.Cancellable.new()

    get iconName() {
        return this.#vol_icon
    }

    get name() {
        return this.#vol_name
    }

    get uuid() {
        return this.#vol_uuid
    }

    get can_mount() {
        return this.#vol_can_mount
    }

    get is_mounted() {
        return this.#vol_is_mounted
    }

    constructor(volume) {
        super()
        this.#vol = volume
        this.#init()
    }

    #init=() => {
        this.#vol_icon=this.#vol?.get_symbolic_icon().get_names()[0]
        this.#vol_name=this.#vol?.get_name()
        this.#vol_uuid=this.#vol?.get_uuid()
        this.#vol_can_mount=this.#vol?.can_mount()
        this.#vol_is_mounted = this.#vol?.get_mount() !== null
        print(this.#vol_name)
        
        this.#vol?.connect("changed", (vol) => {
            if (this.#vol_icon != vol.get_symbolic_icon().get_names()[0]) {
                this.#vol_icon = vol.get_symbolic_icon().get_names()[0]
                this.emit("changed")
                this.changed("icon")
            }
            if (this.#vol_name != vol.get_name()) {
                this.#vol_name = vol.get_name()
                this.emit("changed")
                this.changed("name")
            }
            if (this.#vol_uuid != vol.get_uuid()) {
                this.#vol_uuid = vol.get_uuid()
                this.emit("changed")
                this.changed("uuid")
            }
            if (this.#vol_can_mount != vol.can_mount()) {
                this.#vol_can_mount = vol.can_mount()
                this.emit("changed")
                this.changed("can_mount")
            }
            if (this.#vol_is_mounted != (vol.get_mount() !== null)) {
                this.emit("changed")
                this.#vol_is_mounted = vol.get_mount() !== null
                this.changed("is_mounted")
            }
        })

        this.#vol?.connect("removed", (_) => {
            this.emit("removed")
        })
    }

    /**
     * 
     * @param {AsyncReadyCallback} callback 
     */
    mount(callback) {
        this.#vol?.mount(null, null, this.#cancellable, callback)
    }

    cancell_mount() {
        this.#cancellable.cancel()
    }

    connect(event="changed", callback) {
        return super.connect(event, callback)
    }
}

class Disks extends Service {
    static {
        Service.register(
            this,
            {

                "disk-added": ['jsobject'],
                "disk-removed": ['jsobject']
            },
            {
                "disks": ['jsobject']
            }
        )
    }

    #udevDisks = []
    #volumeMonitor=Gio.VolumeMonitor.get()

    get disks() {
        return this.#udevDisks
    }

    constructor() {
        super()
        
        this.#onMonitorReady()
    }

    #onMonitorReady= () => {
        this.#volumeMonitor.connect("volume-added", (_, volume) => {
            // print(volume.get_name())
            this.#addDisk(volume)
        })
        this.#volumeMonitor.connect("volume-removed", (_, volume) => {
            // print(volume.get_name())
            this.#removeDisk(volume)
        })
    }

    #addDisk=(volume) => {
        let _disk = new Disk(volume)
        this.#udevDisks.push(_disk)
        this.emit("disk-added", _disk)
        this.emit("changed")
        this.changed("disks")
    }

    #removeDisk=(volume) => {
        this.#udevDisks.forEach((value, index, _) => {
            if (value.uuid == volume.get_uuid()) {
                this.#udevDisks.splice(index, 1)
                this.emit("disk-removed", value)
                this.emit("changed")
                this.changed("disks")
            }
        })
    }

    connect(event="changed",callback) {
        return super.connect(event, callback)
    }
}

export default new Disks()