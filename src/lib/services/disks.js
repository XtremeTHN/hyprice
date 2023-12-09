//@ts-nocheck
import Service from "resource:///com/github/Aylur/ags/service.js";

// @ts-ignore
import Gio from 'gi://Gio';
import { execAsync, interval, lookUpIcon } from "resource:///com/github/Aylur/ags/utils.js";
import Variable from "resource:///com/github/Aylur/ags/variable.js";


export class DiskInfo extends Service {
    static {
        Service.register(
            this,
            {

            },
            {
                'available': ['boolean'],
                'size': ['integer'],
                'free': ['integer'],
                'used': ['integer'],
                'mount-path': ['string'],
                'device-path': ['string'],
            }
        )
    }

    #deviceInfoObj=undefined
    #deviceVolumeObj=undefined

    #deviceTotalSize=0
    #deviceFreeSize=0
    #deviceUsedSize=0
    #deviceMountPoint=""
    #deviceDevPath=""

    #deviceAvailable=false

    get device_available() {
        return this.#deviceAvailable
    }

    get size() {
        return this.#deviceTotalSize
    }

    get used() {
        return this.#deviceUsedSize
    }

    get free() {
        return this.#deviceFreeSize
    }

    get mount_path() {
        return this.#deviceMountPoint
    }

    get device_path() {
        return this.#deviceDevPath
    }

    constructor(device) {
        super()
        this.#deviceVolumeObj = device
        this.#deviceVolumeObj.connect("changed", () => {
            console.log("Mounted")
            let mnt_obj = device.get_mount()
            if (mnt_obj !== null) {
                this.#deviceAvailable = true
                this.changed("available")
                this.#onMounted(mnt_obj)
            }
        })

        this.#deviceVolumeObj.connect("removed", () => {
            this.#deviceAvailable = false
            console.log("Removed")
            this.changed("available")
        })
    }

    #onMounted= (mnt_obj) => {
        const mount_path = mnt_obj.get_root().get_path();
        const dev_path = this.#deviceVolumeObj.get_identifier("unix-device");
        
        this.#deviceMountPoint = mount_path
        this.#deviceDevPath = dev_path
        this.changed("mount-path")
        this.changed("device-path")

        console.error(this.#deviceMountPoint)

        execAsync(['lsblk', '-bno', 'SIZE', dev_path]).then(out => {
            this.#deviceTotalSize = out !== "" ? Number(out) : 0
            this.changed("size")
        })

        Variable({used_space: 0, free_space: 0}, {
            listen: ['gdi', this.#deviceMountPoint],
        }).connect("changed", ({value}) => {
            let values = JSON.parse(value)
            this.#deviceUsedSize = values.used_space
            // this.emit("used")

            this.#deviceFreeSize = values.free_space
            // this.emit("free")

            print(this.#deviceUsedSize, this.#deviceFreeSize)
        })

        

        // this.
        // this.#deviceInfoObj = Gio.File.new_for_path(activation_path)
        // this.#deviceFreeSize = Variable(0.00, {
        //     poll: [
        //         [1000, ['fish', "-c", [`df ${activation_path} | awk 'NR==2{print $3}'`]]]
        //     ]
        // })
        // this.#deviceFreeSize
        // interval(1000, this.#updateProps)
    }

    // #updateProps= () => {
    //     let query_info = this.#deviceInfoObj.query_info("standard::*", 0, null)
    //     let size = query_info.get_attribute_uint64("standard::size")
    //     this.#deviceTotalSize = size
        
    //     if (size !== this.#deviceTotalSize) {
    //         this.#deviceTotalSize = size
    //         this.emit("changed")
    //         this.changed("total-size")
    //     }
    // }
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
        this.#vol_info = new DiskInfo(this.#vol)

        // this.#vol_info = 
        print(this.#vol_name)
        
        this.#vol?.connect("changed", (vol) => {
            if (this.#vol_icon != vol.get_symbolic_icon().get_names()[0]) {
                this.#vol_icon = vol.get_symbolic_icon().get_names()[0]
                this.emit("changed")
                this.changed("icon-name")
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