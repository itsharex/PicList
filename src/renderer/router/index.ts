import { createRouter, createWebHashHistory } from 'vue-router'
import * as config from '@/router/config'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: config.TRAY_PAGE,
      component: () => import(/* webpackChunkName: "tray" */ '@/pages/TrayPage.vue')
    },
    {
      path: '/rename-page',
      name: config.RENAME_PAGE,
      component: () => import(/* webpackChunkName: "RenamePage" */ '@/pages/RenamePage.vue')
    },
    {
      path: '/mini-page',
      name: config.MINI_PAGE,
      component: () => import(/* webpackChunkName: "MiniPage" */ '@/pages/MiniPage.vue')
    },
    {
      path: '/main-page',
      name: config.MAIN_PAGE,
      component: () => import(/* webpackChunkName: "SettingPage" */ '@/layouts/Main.vue'),
      children: [
        {
          path: 'upload',
          component: () => import(/* webpackChunkName: "Upload" */ '@/pages/Upload.vue'),
          name: config.UPLOAD_PAGE
        },
        {
          path: 'manage-main-page',
          name: config.MANAGE_MAIN_PAGE,
          component: () => import(/* webpackChunkName: "ManageMainPage" */ '@/manage/pages/ManageMain.vue'),
          children: [
            {
              path: '',
              name: config.MANAGE_EMPTY_PAGE,
              component: () => import(/* webpackChunkName: "ManageEmptyPage" */ '@/manage/pages/EmptyPage.vue')
            },
            {
              path: 'manage-setting-page',
              name: config.MANAGE_SETTING_PAGE,
              component: () => import(/* webpackChunkName: "ManageSettingPage" */ '@/manage/pages/ManageSetting.vue')
            },
            {
              path: 'manage-bucket-page',
              name: config.MANAGE_BUCKET_PAGE,
              component: () => import(/* webpackChunkName: "ManageBucketPage" */ '@/manage/pages/BucketPage.vue')
            }
          ]
        },
        {
          path: 'manage-login-page',
          name: config.MANAGE_LOGIN_PAGE,
          component: () => import(/* webpackChunkName: "ManageLoginPage" */ '@/manage/pages/LogInPage.vue')
        },
        {
          path: 'picbeds/:type/:configId?',
          name: config.PICBEDS_PAGE,
          component: () => import(/* webpackChunkName: "Other" */ '@/pages/picbeds/index.vue')
        },
        {
          path: 'gallery',
          component: () => import(/* webpackChunkName: "GalleryView" */ '@/pages/Gallery.vue'),
          name: config.GALLERY_PAGE,
          meta: {
            keepAlive: true
          }
        },
        {
          path: 'setting',
          name: config.SETTING_PAGE,
          component: () => import(/* webpackChunkName: "setting" */ '@/pages/PicGoSetting.vue')
        },
        {
          path: 'plugin',
          component: () => import(/* webpackChunkName: "Plugin" */ '@/pages/Plugin.vue'),
          name: config.PLUGIN_PAGE
        },
        {
          path: 'shortKey',
          component: () => import(/* webpackChunkName: "ShortkeyPage" */ '@/pages/ShortKey.vue'),
          name: config.SHORTKEY_PAGE
        },
        {
          path: 'uploader-config-page/:type',
          component: () => import(/* webpackChunkName: "Other" */ '@/pages/UploaderConfigPage.vue'),
          name: config.UPLOADER_CONFIG_PAGE
        }
      ]
    },
    {
      path: '/documents',
      component: () => import(/* webpackChunkName: "DocumentPage" */ '@/pages/DocumentPage.vue'),
      name: config.DocumentPage
    },
    {
      path: '/toolbox-page',
      name: config.TOOLBOX_CONFIG_PAGE,
      component: () => import(/* webpackChunkName: "ToolboxPage" */ '@/pages/Toolbox.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})
