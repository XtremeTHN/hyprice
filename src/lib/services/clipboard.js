import Service from "resource:///com/github/Aylur/ags/service.js";
import Variable from "resource:///com/github/Aylur/ags/variable.js";

class Clipboard2 extends Service {
    static {
        Service.register(this,
            {
                'clipboard-write': ['string'],
            },
            {
                'content': ['string', 'rw']
            })
    }

    #clipboardContentC=Variable('', {
        listen: ["/home/axel/.local/bin/clipboard_content", (out) => JSON.parse(out)],
    })

    get clipboardContent() {
        return this.#clipboardContentC.value.content
    }

    set clipboardContent(content) {
        this.#clipboardContentC.value.content = content
    }

    constructor() {
        super()
        this.#clipboardContentC.connect('changed', () => {
            this.emit('clipboard-write', this.clipboardContent)
        })
    }
}

export default new Clipboard2()