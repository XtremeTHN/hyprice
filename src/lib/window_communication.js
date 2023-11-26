import Service from "resource:///com/github/Aylur/ags/service.js"

export class WindowCommunication extends Service {
    static {
        Service.register(
            this,
            {
                "signal": ["string"],
            },
            {
                "signal-value": ["boolean", "rw"]
            }
        )
    }

    _signal_value = false

    get signal_value() {
        return this._signal_value
    }

    set signal_value(value) {
        this._signal_value = value
        this.emit('changed')
        this.notify("signal-value")
    }

    constructor(msg) {
        super()
        this._signal_value = msg
    }

    connect(event="signal", callback) {
        return super.connect(event, callback)
    }
}

const service = new WindowCommunication()

export default service