<template>
  <div id="mini-page">
    <div
      id="upload-area"
      :class="{
        'is-dragover': dragover,
        uploading: isShowingProgress,
        linux: osGlobal === 'linux'
      }"
      :style="{ backgroundPosition: '0 ' + progress + '%' }"
      @drop.prevent="onDrop"
      @dragover.prevent="dragover = true"
      @dragleave.prevent="dragover = false"
    >
      <img
        v-if="!dragover && !isShowingProgress"
        :src="logoPath ? logoPath : require('../assets/squareLogo.png')"
        style="width: 100%; height: 100%; border-radius: 50%"
      />
      <div id="upload-dragger" @dblclick="openUploadWindow">
        <input id="file-uploader" type="file" multiple @change="onChange" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElMessage as $message } from 'element-plus'
import { ipcRenderer, IpcRendererEvent } from 'electron'
import { IConfig } from 'piclist'
import { onBeforeUnmount, onBeforeMount, ref, watch } from 'vue'

import { T as $T } from '@/i18n/index'
import { invokeToMain, sendRPC } from '@/utils/common'
import { getConfig } from '@/utils/dataSender'
import { osGlobal } from '@/utils/global'

import { isUrl } from '#/utils/common'
import { IRPCActionType } from '#/types/enum'

const logoPath = ref('')
const dragover = ref(false)
const progress = ref(0)
const isShowingProgress = ref(false)
const draggingState = ref(false)
const wX = ref(-1)
const wY = ref(-1)
const screenX = ref(-1)
const screenY = ref(-1)

async function initLogoPath() {
  const config = await getConfig<IConfig>()
  if (config) {
    if (config.settings?.isCustomMiniIcon && config.settings?.customMiniIcon) {
      logoPath.value =
        'data:image/jpg;base64,' + (await invokeToMain('convertPathToBase64', config.settings.customMiniIcon))
    }
  }
}

onBeforeMount(async () => {
  await initLogoPath()
  ipcRenderer.on('uploadProgress', (_: IpcRendererEvent, _progress: number) => {
    if (_progress !== -1) {
      isShowingProgress.value = true
      progress.value = _progress
    } else {
      progress.value = 100
    }
  })
  ipcRenderer.on('updateMiniIcon', async () => {
    await initLogoPath()
  })
  window.addEventListener('mousedown', handleMouseDown, false)
  window.addEventListener('mousemove', handleMouseMove, false)
  window.addEventListener('mouseup', handleMouseUp, false)
})

watch(progress, val => {
  if (val === 100) {
    setTimeout(() => {
      isShowingProgress.value = false
    }, 1000)
    setTimeout(() => {
      progress.value = 0
    }, 1200)
  }
})

function onDrop(e: DragEvent) {
  dragover.value = false

  // send files first
  if (e.dataTransfer?.files?.length) {
    ipcSendFiles(e.dataTransfer.files)
  } else if (e.dataTransfer?.items) {
    const items = e.dataTransfer.items
    if (items.length === 2 && items[0].type === 'text/uri-list') {
      handleURLDrag(items, e.dataTransfer)
    } else if (items[0].type === 'text/plain') {
      const str = e.dataTransfer!.getData(items[0].type)
      if (isUrl(str)) {
        sendRPC(IRPCActionType.UPLOAD_CHOOSED_FILES, [{ path: str }])
      } else {
        $message.error($T('TIPS_DRAG_VALID_PICTURE_OR_URL'))
      }
    }
  }
}

function handleURLDrag(items: DataTransferItemList, dataTransfer: DataTransfer) {
  // text/html
  // Use this data to get a more precise URL
  const urlString = dataTransfer.getData(items[1].type)
  const urlMatch = urlString.match(/<img.*src="(.*?)"/)
  if (urlMatch) {
    sendRPC(IRPCActionType.UPLOAD_CHOOSED_FILES, [
      {
        path: urlMatch[1]
      }
    ])
  } else {
    $message.error($T('TIPS_DRAG_VALID_PICTURE_OR_URL'))
  }
}

function openUploadWindow() {
  // @ts-expect-error file-uploader
  document.getElementById('file-uploader').click()
}

function onChange(e: any) {
  ipcSendFiles(e.target.files)
  // @ts-expect-error file-uploader
  document.getElementById('file-uploader').value = ''
}

function ipcSendFiles(files: FileList) {
  const sendFiles: IFileWithPath[] = []
  Array.from(files).forEach(item => {
    const obj = {
      name: item.name,
      path: item.path
    }
    sendFiles.push(obj)
  })
  sendRPC(IRPCActionType.UPLOAD_CHOOSED_FILES, sendFiles)
}

function handleMouseDown(e: MouseEvent) {
  draggingState.value = true
  wX.value = e.pageX
  wY.value = e.pageY
  screenX.value = e.screenX
  screenY.value = e.screenY
}

function handleMouseMove(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  if (draggingState.value) {
    const xLoc = e.screenX - wX.value
    const yLoc = e.screenY - wY.value
    sendRPC(IRPCActionType.SET_MINI_WINDOW_POS, {
      x: xLoc,
      y: yLoc,
      width: 64,
      height: 64
    })
  }
}

function handleMouseUp(e: MouseEvent) {
  draggingState.value = false
  if (screenX.value === e.screenX && screenY.value === e.screenY) {
    if (e.button === 0) {
      // left mouse
      openUploadWindow()
    } else {
      openContextMenu()
    }
  }
}

function openContextMenu() {
  sendRPC(IRPCActionType.SHOW_MINI_PAGE_MENU)
}

onBeforeUnmount(() => {
  ipcRenderer.removeAllListeners('uploadProgress')
  ipcRenderer.removeAllListeners('updateMiniIcon')
  window.removeEventListener('mousedown', handleMouseDown, false)
  window.removeEventListener('mousemove', handleMouseMove, false)
  window.removeEventListener('mouseup', handleMouseUp, false)
})
</script>
<script lang="ts">
export default {
  name: 'MiniPage'
}
</script>
<style lang="stylus">
#mini-page
  background #409EFF
  color #FFF
  height 100vh
  width 100vw
  border-radius 50%
  text-align center
  line-height 100vh
  font-size 40px
  background-size 90vh 90vw
  background-position center center
  background-repeat no-repeat
  position relative
  border 4px solid #fff
  box-sizing border-box
  cursor pointer
  &.linux
    border-radius 0
    background-size 100vh 100vw
  #upload-area
    height 100%
    width 100%
    border-radius 50%
    transition all .2s ease-in-out
    &.linux
      border-radius 0
    &.uploading
      background: linear-gradient(to top, #409EFF 50%, #fff 51%)
      background-size 200%
    #upload-dragger
      height 100%
    &.is-dragover
      background rgba(0,0,0,0.3)
  #file-uploader
    display none
</style>
