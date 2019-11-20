<!--
 * @Author: caizeyong
 * @Date: 2019-11-13 09:11:50
 * @Description: readme
 -->
# postmessage-event-bus
---
event bus based on post message

# Usage
---
## Install

### npm
```javascript
npm i postmessage-event-bus
```
##### es6 modules
```javascript
import { CreatePostMessageEventBus } from 'postmessage-event-bus'
```
---
##### cmd
```javascript
require('postmessage-event-bus')
```

### umd
```html
<script src="https://unpkg.com/postmessage-event-bus@0.0.2/eventBus.min.js"></script>
```

## API
```javascript
let pmeb = CreatePostMessageEventBus({
    success: function () {
        console.log('registry successed')
    },
    receive: function (data) {
        console.log('receive post message data,data.name is message type', data, data.name)
    },
    request: function (cmd) {
        console.log('other window need u send some event. cmd is the message type', cmd)
        this.send({
            name: 'change', // message type
            sum: 100 // value
            ... // other values
        })
    },
    // events that u wanna listen
    on: ['increase', 'decrease'],
    // events that u will dispatch
    // this is for auto dispatch events for some pages that listening thoes events
    // otherwise they would notify current page manually
    // eg:
    // after initialized or success callback in other window
    // pmeb.send({name: 'change'})
    emit: ['change']
})

pmeb.send({
    name: 'otherEvent', // u can dispatch event that not specified in emit params
    data: { ... }
})
```

## Demo
https://zeyongtsai.github.io/postmessage-event-bus/root.html