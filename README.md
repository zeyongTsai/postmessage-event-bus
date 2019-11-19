<!--
 * @Author: caizeyong
 * @Date: 2019-11-13 09:11:50
 * @Description: readme
 -->
# postmessage-event-bus
event bus based on post message

# Usage

## Install
1. ```npm i postmessage-event-bus```
  1. ```import { CreatePostMessageEventBus } from 'postmessage-event-bus'```
  2. ```require('postmessage-event-bus')```
2. 
```html
<script src="https://unpkg.com/postmessage-event-bus@0.0.2/eventBus.min.js"></script>
```

## API
```javascript
CreatePostMessageEventBus({
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
    on: ['increase', 'decrease'], // events that u wanna listen
    emit: ['change'] // events that u will dispatch
})
```

## Demo
https://zeyongtsai.github.io/postmessage-event-bus/root.html