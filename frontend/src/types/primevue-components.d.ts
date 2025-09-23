declare module 'vue' {
  export interface GlobalComponents {
    Button: typeof import('primevue/button')['default']
    Card: typeof import('primevue/card')['default']
    Checkbox: typeof import('primevue/checkbox')['default']
    Divider: typeof import('primevue/divider')['default']
    Dropdown: typeof import('primevue/dropdown')['default']
    InputText: typeof import('primevue/inputtext')['default']
    InputTextarea: typeof import('primevue/inputtextarea')['default']
    Listbox: typeof import('primevue/listbox')['default']
    Message: typeof import('primevue/message')['default']
    Password: typeof import('primevue/password')['default']
    TabPanel: typeof import('primevue/tabpanel')['default']
    TabView: typeof import('primevue/tabview')['default']
    Tag: typeof import('primevue/tag')['default']
  }
}

export {}
