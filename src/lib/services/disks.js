//@ts-nocheck
import Service from "resource:///com/github/Aylur/ags/service.js";

// @ts-ignore
import Gio from 'gi://Gio';
import { lookUpIcon } from "resource:///com/github/Aylur/ags/utils.js";
import Variable from "resource:///com/github/Aylur/ags/variable.js";


export class DiskInfo extends Service {
    static {
        Service.register(
            this,
            {
                'available': ['boolean'],
            },
            {
                'total-size': ['integer'],
                'free-size': ['integer'],
                'used-size': ['integer'],
                'mount-point': ['string'],
            }
        )
    }

    #deviceVolumeObj=undefined
    #deviceVariables=[]
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

    get total_space() {
        return this.#deviceInfo["total-size"]
    }

    get total_space_fraction() {
        return this.#deviceInfo["total-size"] / 1
    }

    get free_space() {
        return this.#deviceInfo["free-size"]
    }

    get free_space_fraction() {
        return this.#deviceInfo["free-size"] / 1
    }

    get used_space() {
        return this.#deviceInfo["used-size"]
    }

    get used_space_fraction() {
        return this.#deviceInfo["used-size"] / 1
    }

    get mount_point() {
        return this.#deviceInfo['mount-point']
    }

    constructor(device) {
        super()
        this.#deviceVolumeObj = device
        this.#deviceVolumeObj.connect("changed", () => {
            let mnt_obj = device.get_mount()
            if (mnt_obj !== null) {
                this.#deviceAvailable = true
                this.changed("available")
                this.#onMounted(mnt_obj)
            }
        })

        this.#deviceVolumeObj.connect("removed", () => {
            this.#deviceVariables.forEach((value, _, __) => {
                value.dispose()
            })

            this.#deviceVariables=[]
        })
    }

    #onMounted= (mnt_obj) => {
        const activation_path = mnt_obj.get_activation_root().get_path();
        const dev_path = this.#deviceVolumeObj.get_identifier("unix-device")

        this.#deviceVariables.push(...[
                // Total space
                Variable(0, {
                    poll: [
                        [1000, ['fish', '-c', ['df', activation_path, '|', 'awk', 'NR==2', '{print $2}']]]
                    ]
                }),

                // Used space
                Variable(0, {
                    poll: [
                        [1000, ['fish', '-c', ['df', activation_path, '|', 'awk', 'NR==2', '{print $3']]]
                    ]
                }),

                // Free space
                Variable(0, {
                    poll: [
                        [1000, ['fish', '-c', ['df', activation_path, '|', 'awk', 'NR==2', '{print $3']]]
                    ]
                })
        ])

        this.#deviceVariables[0].connect("change", (self, _) => {
            this.#deviceInfo["total-size"] = self.value
        })

        this.#deviceVariables[1].connect("change", (self, _) => {
            this.#deviceInfo["used-size"] = self.value
        })

        this.#deviceVariables[2].connect("change", (self, _) => {
            this.#deviceInfo["free-size"] = self.value
        })

        // this.#deviceInfoObj = Gio.File.new_for_path(activation_path)

        // let query_info = this.#deviceInfoObj.query_filesystem_info('GvfsMountInfo', null)
        // query_info.connect("notify", (self,  _) => {
        //     this.#deviceInfo['total-size'] = query_info.get_attribute_as_uint64('total-space')
        //     this.#deviceInfo['free-size'] = query_info.get_attribute_as_uint64('free-space')
        //     this.emit("changed")
        // })


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

    // get info() {
    //     return this.#vol_info
    // }

    constructor(volume) {
        super()
        this.#vol = volume
        this.#init()
    }

    #geticon=(vol=this.#vol) => {
        return vol?.get_symbolic_icon().get_names().filter(name => {
            return lookUpIcon(name) !== null
        })[0]
    }

    #init=() => {
        this.#vol_icon=this.#geticon()
        print(this.#vol_icon)
        this.#vol_name=this.#vol?.get_name()
        this.#vol_uuid=this.#vol?.get_uuid()
        this.#vol_can_mount=this.#vol?.can_mount()
        this.#vol_is_mounted = this.#vol?.get_mount() !== null
        // this.#vol_info = new DiskInfo(this.#vol)

        // this.#vol_info = 
        print(this.#vol_name)
        
        this.#vol?.connect("changed", (vol) => {
            if (this.#vol_icon != this.#geticon(vol)) {
                this.#vol_icon = this.#geticon(vol)
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

    /**
     * 
     * @param {AsyncReadyCallback} callback 
     */
    umount(callback) {
        this.#vol?.eject_with_operation(0, null, this.#cancellable, callback)
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