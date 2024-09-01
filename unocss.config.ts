import { presetNimiq } from 'nimiq-css'
import { defineConfig, presetAttributify, presetIcons, presetUno } from 'unocss'
import { presetRemToPx } from '@unocss/preset-rem-to-px'
import transformerDirectives from '@unocss/transformer-directives'

export default defineConfig({
  presets: [
    presetUno({ attributifyPseudo: true }),
    presetNimiq({
      utilities: true,
      attributifyUtilities: true,
      icons: false,
    }),
    presetRemToPx({ baseFontSize: 4 }),
    presetAttributify(),
    presetIcons({
      collections: {
        nimiq: async () => {
          return await fetch(
            'https://raw.githubusercontent.com/onmax/nimiq-ui/main/packages/nimiq-icons/dist/icons.json',
          ).then(res => res.json() as any)
        },
        custom: {
          curly: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 228 177"><circle cx="96.5" cy="92.5" r="4.5" fill="currentColor"/><circle cx="113.5" cy="92.5" r="4.5" fill="currentColor"/><circle cx="130.5" cy="92.5" r="4.5" fill="currentColor"/><path fill="currentColor" d="m18.424-.001.204.204v.951c0 .25-.158.465-.476.646-1.745 1.201-3.184 2.742-4.317 4.623-1.133 1.882-1.892 3.978-2.278 6.29a.554.554 0 0 1-.034.135c-.09.635-.147 2.584-.17 5.847V22.401c0 5.484-.01 8.25-.033 8.294-.023.091-.125.148-.306.17-.182.023-.748.034-1.7.034-1.179 0-1.79-.01-1.836-.034a.204.204 0 0 1-.136-.136c-.045-.226-.068-2.89-.068-7.988v-2.788c0-1.133-.011-1.926-.034-2.38 0-2.243.102-3.977.306-5.2.204-1.224.68-2.595 1.428-4.114 1.722-3.4 4.329-6.073 7.819-8.022l.442-.238h1.19Z"/><path fill="currentColor" d="M7.274 44.157V33.405c0-2.348.057-3.677.17-3.986.046-.061.794-.092 2.244-.092.93 0 1.416.03 1.462.092.09.062.147.402.17 1.02.022.927.034 5.5.034 13.718V56.95c0 1.236-.057 1.885-.17 1.947h-.034c-.046.061-.658.092-1.836.092s-1.79-.03-1.836-.092c-.09-.062-.147-.402-.17-1.02-.022-.927-.034-5.5-.034-13.718Z"/><path fill="currentColor" d="M7.445 57.449c.045-.023.793-.035 2.243-.035.93 0 1.417.012 1.462.035a.204.204 0 0 1 .136.135c.045.227.068 2.845.068 7.853 0 5.28-.011 8.023-.034 8.227-.204 3.014-1.088 5.767-2.651 8.26-1.564 2.493-3.627 4.533-6.187 6.12l-.476.305.476.306c2.402 1.496 4.419 3.479 6.05 5.95 1.632 2.47 2.562 5.28 2.788 8.43.023.204.034 2.946.034 8.227v6.968c0 .658-.056.998-.17 1.02h-.034c-.045.023-.657.034-1.836.034-1.178 0-1.79-.011-1.835-.034a.203.203 0 0 1-.136-.136c-.046-.226-.068-2.833-.068-7.818v-4.862c0-2.402-.08-4.283-.238-5.643-.159-1.36-.555-2.787-1.19-4.283a16.008 16.008 0 0 0-1.394-2.788c-.544-.86-1.065-1.575-1.563-2.141a13.412 13.412 0 0 0-1.394-1.394c-.43-.363-.782-.657-1.054-.884l-.408-.34C.011 88.94 0 88.735 0 88.35c0-.385.011-.589.034-.612 0-.022.227-.203.68-.543.453-.34 1.008-.873 1.666-1.598a27.105 27.105 0 0 0 2.04-2.584c.702-.997 1.314-2.323 1.835-3.977.521-1.654.85-3.41.986-5.27.022-.271.034-3.059.034-8.362 0-5.144.011-7.75.034-7.819l.136-.136Z"/><path fill="currentColor" d="M7.274 132.541v-10.752c0-2.348.057-3.677.17-3.986.046-.062.794-.093 2.244-.093.93 0 1.416.031 1.462.093.09.062.147.402.17 1.02.022.927.034 5.5.034 13.718v12.792c0 1.236-.057 1.885-.17 1.946h-.034c-.046.062-.658.093-1.836.093s-1.79-.031-1.836-.093c-.09-.061-.147-.401-.17-1.019-.022-.927-.034-5.5-.034-13.719Z"/><path fill="currentColor" d="m18.628 176.498-.204.204h-1.19l-.374-.204c-2.81-1.541-5.053-3.569-6.73-6.085-1.678-2.515-2.618-5.212-2.822-8.09-.023-.227-.034-2.425-.034-6.595 0-6.459.011-9.711.034-9.757l.136-.136c.068-.022.691-.034 1.87-.034.951 0 1.518.012 1.7.034.18.023.283.08.305.17.023.046.034 2.799.034 8.261v4.317c0 2.357.046 4.023.136 4.997.09.975.34 2.063.748 3.264a17.416 17.416 0 0 0 1.326 3.025c.521.929 1.065 1.711 1.632 2.346a19.88 19.88 0 0 0 1.495 1.53c.431.385.861.736 1.292 1.053.43.318.635.465.612.442-.023-.022-.011.204.034.68v.578ZM209.372.814c0-.385.023-.611.068-.68.045-.067.238-.113.578-.135h.748l.374.204c2.787 1.518 5.031 3.535 6.731 6.05 1.699 2.516 2.64 5.224 2.821 8.125.023.204.034 2.992.034 8.363v7.105c0 .68-.056 1.02-.17 1.02h-.034c-.045.022-.657.033-1.835.033-.952 0-1.519-.01-1.7-.034-.182-.022-.283-.079-.306-.17-.023-.045-.034-2.81-.034-8.294V18.117c0-2.334-.045-4-.136-4.997-.091-.997-.34-2.085-.748-3.263a17.487 17.487 0 0 0-1.326-3.026c-.521-.929-1.065-1.71-1.632-2.345a19.646 19.646 0 0 0-1.495-1.53 17.59 17.59 0 0 0-1.292-1.054c-.431-.317-.635-.464-.612-.442.023.023.011-.192-.034-.646Z"/><path fill="currentColor" d="M216.646 44.157V33.405c0-2.348.057-3.677.17-3.986.045-.061.793-.092 2.244-.092.929 0 1.416.03 1.461.092.091.062.148.402.17 1.02.023.927.034 5.5.034 13.718V56.95c0 1.236-.056 1.885-.17 1.947h-.034c-.045.061-.657.092-1.835.092-1.179 0-1.791-.03-1.836-.092-.091-.062-.147-.402-.17-1.02-.023-.927-.034-5.5-.034-13.718Z"/><path fill="currentColor" d="M216.816 57.449c.045-.023.793-.035 2.244-.035.929 0 1.416.012 1.461.035a.203.203 0 0 1 .136.135c.046.227.068 2.833.068 7.82v4.86c0 2.403.08 4.284.238 5.643.159 1.36.556 2.788 1.19 4.284.385.997.85 1.926 1.394 2.787.544.861 1.065 1.575 1.564 2.142.498.566.963 1.031 1.393 1.394a305.406 305.406 0 0 0 1.462 1.223c.023.023.034.227.034.612 0 .386-.011.59-.034.612 0 .023-.227.204-.68.544-.453.34-1.008.873-1.665 1.598a26.906 26.906 0 0 0-2.04 2.583c-.703.998-1.315 2.323-1.836 3.978a23.103 23.103 0 0 0-.986 5.269c-.022.272-.034 3.059-.034 8.363v6.934c0 .658-.056.998-.17 1.02h-.034c-.045.023-.657.034-1.835.034-1.179 0-1.791-.011-1.836-.034a.204.204 0 0 1-.136-.136c-.045-.226-.068-2.844-.068-7.852 0-5.281.011-8.023.034-8.227.204-3.014 1.088-5.768 2.652-8.26 1.563-2.494 3.626-4.533 6.187-6.12l.475-.306-.475-.306c-2.403-1.495-4.42-3.478-6.051-5.949-1.632-2.47-2.561-5.28-2.788-8.43-.023-.227-.034-2.391-.034-6.493 0-6.346.011-9.541.034-9.587l.136-.136Z"/><path fill="currentColor" d="M216.646 132.541v-10.752c0-2.348.057-3.677.17-3.986.045-.062.793-.093 2.244-.093.929 0 1.416.031 1.461.093.091.062.148.402.17 1.02.023.927.034 5.5.034 13.718v12.792c0 1.236-.056 1.885-.17 1.946h-.034c-.045.062-.657.093-1.835.093-1.179 0-1.791-.031-1.836-.093-.091-.061-.147-.401-.17-1.019-.023-.927-.034-5.5-.034-13.719Z"/><path fill="currentColor" d="M216.647 154.266v-6.187c0-1.383.057-2.13.17-2.244.045-.022.793-.034 2.243-.034.93 0 1.417.012 1.462.034a.204.204 0 0 1 .136.136c.046.227.068 2.89.068 7.989v2.753c0 1.134.012 1.927.034 2.38 0 2.38-.147 4.306-.442 5.779-.294 1.473-.94 3.06-1.937 4.759-1.768 2.924-4.182 5.213-7.241 6.867l-.374.204h-.544c-.431 0-.68-.034-.748-.102-.068-.068-.102-.317-.102-.748 0-.362.011-.578.034-.646.023-.068.17-.17.442-.306 1.768-1.201 3.218-2.753 4.351-4.657 1.133-1.903 1.881-3.988 2.244-6.255 0-.022.011-.056.034-.102.091-.657.147-2.595.17-5.813v-3.807Z"/></svg>`,
        },
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
  ],
})
