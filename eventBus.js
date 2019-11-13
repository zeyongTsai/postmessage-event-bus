/*
 * @Author: caizeyong
 * @Date: 2019-11-06 16:46:43
 * @Description: 基于 postmessage 的 事件总线实现，通过window.top 在各个子窗口间发送消息
 */
;(function moduleDefinition(root, factory) {
    var $ = 'CreatePostMessageEventBus'; // 自定义模块名

    if ('object' === typeof exports && 'object' === typeof module) {
        module.exports[$] = factory(); // 兼容 CommonJS
    } else if ('function' === typeof define && (define.amd || define.cmd)) {
        define(factory); // 兼容 AMD/CMD
    } else if ('object' === typeof exports) {
        exports[$] = factory();
    } else if (root) {
        root[$] = factory();
    }
})(this, (function () {
    'use strict';
    var instanceObj
    function CreatePostMessageEventBus (options) {
        if (instanceObj) {
            return instanceObj
        }
        instanceObj = new PostMessageEventBus(options)
        instanceObj.init()
        return instanceObj
    }

    function PostMessageEventBus (options) {
        this.options = options
        // 窗口的引用
        this.sources = []
        this.postMessageCenter = new PostMessageCenter()
        this.postMessageCenter.watch(this.handler.bind(this))
    }
    // 处理接收到的事件
    PostMessageEventBus.prototype.handler = function (event) {
        var that = this
        // data  origin source
        // 对于子窗口来讲，目前有两种情况需要向root发送事件
        // 1 向root注册，告知其对哪些事件感兴趣
        // 2 向root发送数据，中转到别的对这些数据感兴趣的窗口
        // 对于root窗口来说，有以下情况需要向子窗口发送事件
        // 1 告知子窗口注册成功
        // 2 有别的窗口发来了数据推送
        // 3 子窗口注册成功后，子窗口感兴趣某些事件，遍历所有其他窗口要求这些有对应事件的窗口派发相应事件

        // 对子窗口来讲
        // 1 接收到root发来的数据事件
        // 2 接收到root发来的注册成功的事件
        // 3 接收到root发来的派发指定事件指令的事件（通常发生在有新的子窗口感兴趣已经存在的子窗口的事件，需要获取数据的情况）
        // 对于root窗口来说
        // 1 接收到子窗口的注册事件
        // 2 接收到子窗口的数据推送事件
        if (window === window.top) {
            switch (event.data.type) {
                case 'REGISTER':
                    // 0 收集窗口
                    this.sources.push(new FrameSource(event.data.data.eventNames, event.origin, event.source))
                    // 1 反馈注册成功
                    this.postMessageCenter.send(event.source,new this.postMessageCenter.EventData('REGISTER-SUCCESS'))
                    // 2 通过子窗口其感兴趣的事件来通知各个其他窗口再次派发对应事件
                    // 并不需要通过子窗口会派发的事件来要求子窗口派发，因为其注册成功后可以单独派发
                    this.sources.forEach(function(source){
                        source.eventNames.on.forEach(function(onName){
                            if (event.data.data.eventNames.emit.indexOf(onName)){
                                that.postMessageCenter.send(source.source, new that.postMessageCenter.EventData('EMIT', onName))
                            }
                        })
                    })
                    break;
                case 'PUSH':
                    var eventName = event.data.data.name
                    this.sources.forEach(function (source) {
                        if (source.eventNames.on.indexOf(eventName) > -1) {
                            that.postMessageCenter.send(source.source, event.data)
                        }
                    })
                    break;
            }
        } else {
            switch (event.data.type) {
                case 'REGISTER-SUCCESS':
                    this.options.success && typeof this.options.success === 'function' && this.options.success.call(this)
                    break;
                case 'PUSH':
                    this.options.receive && typeof this.options.receive === 'function' && this.options.receive.call(this, event.data.data)
                    break;
                case 'EMIT':
                    this.options.request && typeof this.options.request === 'function' && this.options.request.call(this, event.data.data)
            }
        }
    }
    PostMessageEventBus.prototype.init = function () {
        // 初始化的时候， 子窗口向root进行注册，并带上子窗口感兴趣的事件和要派发的事件
        this.postMessageCenter.send(window.top, new this.postMessageCenter.EventData('REGISTER', {
            eventNames: {
                on: this.options.on || [],
                emit: this.options.emit || []
            }
        }))
    }
    PostMessageEventBus.prototype.send = function (data) {
        this.postMessageCenter.send(window.top, new this.postMessageCenter.EventData('PUSH', data))
    }
    // post message 事件处理
    function PostMessageCenter () {
        this.watch = function (fn) {
            window.addEventListener('message', function(event) {
                // 对数据进行验证，判断是不是我们要求的格式，如果不是则忽略
                fn(event)
            })
        }
        this.send = function (otherWindow, message, url) {
            otherWindow.postMessage(message, url || '*')
        }
        this.EventData = EventData
    }

    // 消息数据类
    function EventData (type, data) {
        if (!this.valid(type)) {
            throw new Error('type is not correct')
        }
        this.type = type
        this.data = data
    }
    EventData.prototype.EVENTS = ['REGISTER', 'REGISTER-SUCCESS', 'PUSH', 'EMIT']
    EventData.prototype.valid = function (type) {
        return this.EVENTS.indexOf(type) > -1
    }

    // 窗口源类
    function FrameSource (eventNames, origin, source) {
        eventNames.on = eventNames.on || []
        eventNames.emit = eventNames.emit || []
        this.eventNames = eventNames
        this.origin = origin
        this.source = source
    }
    return CreatePostMessageEventBus
}));