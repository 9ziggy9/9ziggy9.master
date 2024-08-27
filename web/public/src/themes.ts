/*
  This is a pretty clunky way of doing this, reading a lot into memory.
  In the future I should perhaps store things in a public JSON and only read as
  needed.
*/

export function bootstrap(): ThemeController {
  let _curr: HTMLElement | null = null;
  const lib: ThemeLibrary = {};
  BOOTSTRAP_LIBRARY(lib);
  const styleEntry = document.createElement("style");
  styleEntry.id = "color-theme";
  document.head.appendChild(styleEntry);
  return {
    lib,
    select: function (name: string) {
      const theme = this.lib[name];
      const styleContainer
        = document.getElementById("color-theme") as HTMLElement;
      styleContainer.innerHTML = theme.css;
      Object.entries(this.lib).forEach(([_, pair]) => pair.active = false);
      theme.active = true;
      document.cookie = `theme=${name};path=/`;
    },
    cycleCurrent: (curr: HTMLElement) =>  {
      if (_curr) _curr.classList.remove("color-theme-btn-on");
      curr.classList.add("color-theme-btn-on");
      _curr = curr;
    },
    getSavedTheme: () => {
      const match = document.cookie.match(new RegExp('(^| )theme=([^;]+)'));
      return match ? match[2] : null;     
    }
  };
}

function BOOTSTRAP_LIBRARY(lib: ThemeLibrary): void {
  function REGISTER_THEME(name: string, source: string): void {
    lib[name] = { css: source, active: false };
  }
  REGISTER_THEME("NINEZIG", `
        :root {
            --color-dark:         #232A2D;
            --color-light-red:    #E57474;
            --color-light-green:  #8CCF7E;
            --color-light-yellow: #E5C76B;
            --color-light-blue:   #67B0E8;
            --color-light-purple: #C47FD5;
            --color-teal:         #6CBFBF;
            --color-light-gray:   #B3B9B8;
            --color-darker-gray:  #2D3437;
            --color-black:        #000000;
            --color-red:          #EF7E7E;
            --color-green:        #96D988;
            --color-yellow:       #F4D67A;
            --color-blue:         #71BAF2;
            --color-purple:       #CE89DF;
            --color-light-teal:   #67CBE7;
            --color-gray:         #BDC3C2;
            --color-white:        #eceff4;
        }
`)

  REGISTER_THEME("SOLARIZED", `
        :root {
            --color-dark:         #073642;
            --color-light-red:    #dc322f;
            --color-light-green:  #859900;
            --color-light-yellow: #b58900;
            --color-light-blue:   #268bd2;
            --color-light-purple: #6c71c4;
            --color-teal:         #2aa198;
            --color-light-gray:   #93a1a1;
            --color-darker-gray:  #002b36;
            --color-black:        #002b36;
            --color-red:          #cb4b16;
            --color-green:        #586e75;
            --color-yellow:       #657b83;
            --color-blue:         #839496;
            --color-purple:       #6c71c4;
            --color-light-teal:   #2aa198;
            --color-gray:         #657b83;
            --color-white:        #fdf6e3;
        }
`)

  REGISTER_THEME("NORD", `
        :root {
            --color-dark:         #4c566a;
            --color-light-red:    #bf616a;
            --color-light-green:  #a3be8c;
            --color-light-yellow: #ebcb8b;
            --color-light-blue:   #81a1c1;
            --color-light-purple: #b48ead;
            --color-teal:         #88c0d0;
            --color-light-gray:   #e5e9f0;
            --color-darker-gray:  #3b4252;
            --color-black:        #2e3440;
            --color-red:          #bf616a;
            --color-green:        #a3be8c;
            --color-yellow:       #ebcb8b;
            --color-blue:         #81a1c1;
            --color-purple:       #b48ead;
            --color-light-teal:   #8fbcbb;
            --color-gray:         #e5e9f0;
            --color-white:        #ffffff;
        }
`)

  REGISTER_THEME("GRUVBOX", `
        :root {
            --color-dark:         #000000;
            --color-light-red:    #fb4934;
            --color-light-green:  #b8bb26;
            --color-light-yellow: #fabd2f;
            --color-light-blue:   #83a598;
            --color-light-purple: #d3869b;
            --color-teal:         #8ec07c;
            --color-light-gray:   #d5c4a1;
            --color-darker-gray:  #1d2021;
            --color-black:        #282828;
            --color-red:          #cc241d;
            --color-green:        #98971a;
            --color-yellow:       #d79921;
            --color-blue:         #458588;
            --color-purple:       #b16286;
            --color-light-teal:   #689d6a;
            --color-gray:         #a89984;
            --color-white:        #ebdbb2;
        }
`)

  REGISTER_THEME("MONOKAI", `
        :root {
            --color-dark:         #1e1e1e;
            --color-light-red:    #f92672;
            --color-light-green:  #a6e22e;
            --color-light-yellow: #f4bf75;
            --color-light-blue:   #66d9ef;
            --color-light-purple: #ae81ff;
            --color-teal:         #a1efe4;
            --color-light-gray:   #f8f8f2;
            --color-darker-gray:  #1e1e1e;
            --color-black:        #272822;
            --color-red:          #f92672;
            --color-green:        #a6e22e;
            --color-yellow:       #f4bf75;
            --color-blue:         #66d9ef;
            --color-purple:       #ae81ff;
            --color-light-teal:   #a1efe4;
            --color-gray:         #f8f8f2;
            --color-white:        #f9f9f9;
        }
`)

  REGISTER_THEME("DRACULA", `
        :root {
            --color-dark:         #1c1c1c;
            --color-light-red:    #ff5555;
            --color-light-green:  #50fa7b;
            --color-light-yellow: #f1fa8c;
            --color-light-blue:   #6272a4;
            --color-light-purple: #bd93f9;
            --color-teal:         #8be9fd;
            --color-light-gray:   #f8f8f2;
            --color-darker-gray:  #1c1c1c;
            --color-black:        #282a36;
            --color-red:          #ff5555;
            --color-green:        #50fa7b;
            --color-yellow:       #f1fa8c;
            --color-blue:         #6272a4;
            --color-purple:       #bd93f9;
            --color-light-teal:   #8be9fd;
            --color-gray:         #f8f8f2;
            --color-white:        #ffffff;
        }
`)

  REGISTER_THEME("MONOGREEN", `
        :root {
            --color-dark:         #002200;
            --color-light-red:    #ff5c5c;
            --color-light-green:  #a4d300;
            --color-light-yellow: #d3d300;
            --color-light-blue:   #5c8cff;
            --color-light-purple: #a07ac5;
            --color-teal:         #00d9b1;
            --color-light-gray:   #b2b2b2;
            --color-darker-gray:  #001a00;
            --color-black:        #003300;
            --color-red:          #ff5c5c;
            --color-green:        #a4d300;
            --color-yellow:       #d3d300;
            --color-blue:         #5c8cff;
            --color-purple:       #a07ac5;
            --color-light-teal:   #00d9b1;
            --color-gray:         #b2b2b2;
            --color-white:        #ffffff;
        }
`)

  REGISTER_THEME("OCEANIC", `
        :root {
            --color-dark:         #2a3b4c;
            --color-light-red:    #ec5f67;
            --color-light-green:  #99c794;
            --color-light-yellow: #fac863;
            --color-light-blue:   #6699cc;
            --color-light-purple: #c594c5;
            --color-teal:         #5fb3b3;
            --color-light-gray:   #dfe1e8;
            --color-darker-gray:  #1b2b34;
            --color-black:        #1b2b34;
            --color-red:          #ec5f67;
            --color-green:        #99c794;
            --color-yellow:       #fac863;
            --color-blue:         #6699cc;
            --color-purple:       #c594c5;
            --color-light-teal:   #5fb3b3;
            --color-gray:         #dfe1e8;
            --color-white:        #ffffff;
        }
`)

  REGISTER_THEME("TOKYO", `
        :root {
            --color-dark:         #16161e;
            --color-light-red:    #f7768e;
            --color-light-green:  #9ece6a;
            --color-light-yellow: #e0af68;
            --color-light-blue:   #7aa2f7;
            --color-light-purple: #bb9af7;
            --color-teal:         #73daca;
            --color-light-gray:   #c0caf5;
            --color-darker-gray:  #1a1b26;
            --color-black:        #1a1b26;
            --color-red:          #f7768e;
            --color-green:        #9ece6a;
            --color-yellow:       #e0af68;
            --color-blue:         #7aa2f7;
            --color-purple:       #bb9af7;
            --color-light-teal:   #73daca;
            --color-gray:         #c0caf5;
            --color-white:        #ffffff;
        }
`)

  REGISTER_THEME("TOMORROW", `
        :root {
            --color-dark:         #1d1f21;
            --color-light-red:    #cc6666;
            --color-light-green:  #b5bd68;
            --color-light-yellow: #f0c674;
            --color-light-blue:   #81a2be;
            --color-light-purple: #b294bb;
            --color-teal:         #8abeb7;
            --color-light-gray:   #c5c8c6;
            --color-darker-gray:  #1d1f21;
            --color-black:        #1d1f21;
            --color-red:          #cc6666;
            --color-green:        #b5bd68;
            --color-yellow:       #f0c674;
            --color-blue:         #81a2be;
            --color-purple:       #b294bb;
            --color-light-teal:   #8abeb7;
            --color-gray:         #c5c8c6;
            --color-white:        #ffffff;
        }
`)

  REGISTER_THEME("RAILCAST", `
        :root {
            --color-dark:         #282828;
            --color-light-red:    #cc3333;
            --color-light-green:  #4e9a06;
            --color-light-yellow: #fce94f;
            --color-light-blue:   #3465a4;
            --color-light-purple: #75507b;
            --color-teal:         #06989a;
            --color-light-gray:   #d3d0c8;
            --color-darker-gray:  #1e1e1e;
            --color-black:        #1e1e1e;
            --color-red:          #cc3333;
            --color-green:        #4e9a06;
            --color-yellow:       #fce94f;
            --color-blue:         #3465a4;
            --color-purple:       #75507b;
            --color-light-teal:   #06989a;
            --color-gray:         #d3d0c8;
            --color-white:        #ffffff;
        }
`)
}
