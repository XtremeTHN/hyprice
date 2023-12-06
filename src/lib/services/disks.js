//@ts-nocheck
import Service from "resource:///com/github/Aylur/ags/service.js";

// @ts-ignore
import Gio from 'gi://Gio';
import { lookUpIcon } from "resource:///com/github/Aylur/ags/utils.js";


export class DiskInfo extends Service {
    static {
        Service.register(
            this,
            {
                'total-size': ['int'],
                'free-size': ['int'],
                'used-size': ['int'],
                'mount-point': ['string'],
            },
            {
                'available': ['boolean'],
            }
        )
    }

    #deviceInfoObj=undefined
    #deviceInfo={
        'total-size': 0,
        'free-size': 0,
        'used-size': 0,
        'mount-point': '',
    }
    #deviceMountObj=undefined

    #deviceAvailable=false

    get available() {
        return this.#deviceAvailable
    }

    constructor(device) {
        super()
        device.connect("changed", (self, _) => {
            let mnt_obj = self.get_mount()
            if (mnt_obj !== null) {
                this.#deviceAvailable = true
                this.#deviceMountObj = mnt_obj
                this.changed("available")
                this.#onMounted()
            }
        })
    }

    #onMounted= () => {
        const activation_path = this.#deviceMountObj.get_activation_root().get_path();
        this.#deviceInfoObj = Gio.File.new_for_path(activation_path)

        let query_info = this.#deviceInfoObj.query_filesystem_info('GvfsMountInfo', null)
        query_info.connect("notify", (self,  _) => {
            this.#deviceInfo['total-size'] = query_info.get_attribute_as_uint64('total-space')
            this.#deviceInfo['free-size'] = query_info.get_attribute_as_uint64('free-space')
            this.emit("changed")
        })
    }
}


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
                'is_mounted': ['boolean'],
                'info': ['jsobject']
            }
        )
    }

    #vol=undefined
    #vol_icon=undefined
    #vol_name=undefined
    #vol_uuid=undefined
    #vol_info=undefined
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

    get info() {
        return this.#vol_info
    }

    constructor(volume) {
        super()
        this.#vol = volume
        this.#init()
    }

    #init=() => {
        this.#vol_icon=this.#vol?.get_symbolic_icon().get_names().filter(name => {
            if (lookUpIcon(name) !== null) {
                return true
            }
        })[0]
        this.#vol_name=this.#vol?.get_name()
        this.#vol_uuid=this.#vol?.get_uuid()
        this.#vol_can_mount=this.#vol?.can_mount()
        this.#vol_is_mounted = this.#vol?.get_mount() !== null
        if (this.#vol?.get_mount() !== null) {
            this.#vol_info = new DiskInfo(this.#vol)
        }

        // this.#vol_info = 
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

            if (vol.get_mount() === null) {
                this.#vol_info = null
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
        this.#volumeMonitor.get_volumes().map((volume) => {
            this.#addDisk(volume)
        })

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