<script lang="ts">
  import Icon from 'svelte-awesome';
  import {faChevronDown, faSun} from '@fortawesome/free-solid-svg-icons'
  import {faComments, faPhone, faMoon, faUserSecret, faLock} from '@fortawesome/free-solid-svg-icons'
  import { theme } from '../src/store'

  import Nav from './components/Nav.svelte'
  import Header from './components/Header.svelte'

  import Phone from './components/Phone.svelte'
  import { faOsi } from '@fortawesome/free-brands-svg-icons';

  let hasHash = Boolean(window.location.hash)

  let PhoneComponent
</script>

<svelte:window on:hashchange={() => hasHash = Boolean(window.location.hash) }/>

<main class="dark:bg-backgroundDark transition-all">
  <Nav />
  <Header />

  <div id="Features" class="dark:text-white">
    <div class="text-center mx-auto mb-14 xl:mt-0 mt-5 {!hasHash && 'animate-bounce'}">
      <a href="#Features" >
        <Icon data={faChevronDown} scale="3" class="{hasHash && 'text-borderLight'}" />
      </a>
    </div>
  
    <div class="flex xl:flex-row flex-col gap-x-10 mt-14 max-w-6xl mx-auto items-center">
      <div class="xl:justify-self-end xl:text-right xl:max-w-none w-96 max-w-lg mx-auto justify-center text-center flex flex-col gap-y-10">
        <div>
          <Icon data={faComments} scale="5" class="text-primaryLight dark:text-primaryDark" />
          <h3 class="text-3xl font-bold mt-2">Chat</h3>
          <p class="text-lg font-light leading-tight mt-3 h-32">
            We offer standard IM app functions such as text messaging (obviously), sending media upto 16 MB and notifications. Other basic features include contact sharing, nickanaming and notifications blocking.
          </p>
        </div>
        <div>
          <Icon data={faPhone} scale="4" class="text-primaryLight dark:text-primaryDark" />
          <h3 class="text-3xl font-bold mt-2">Call</h3>
          <p class="text-lg font-light leading-tight mt-3 h-32">
            Thanks to WebRTC technology we can offer seamless peer-to-peer audio and video connection. Our app hooks directly into Android's built-in call handling system, so every call will be announced with your favourite ringtone.
          </p>
        </div>
        <div>
          <span
            on:click={() => {
              theme.set($theme === 'dark' ? 'light' : 'dark')
            }}
          >
            <Icon 
              data={$theme === "dark" ? faSun : faMoon} 
              scale="4" 
              class="text-primaryLight dark:text-primaryDark cursor-pointer hover:scale-90 transition"
            />
          </span>
          <h3 class="text-3xl font-bold mt-2">{$theme === "dark" ? "Light mode" : "Dark mode"}</h3>
          <p class="text-lg font-light leading-tight mt-3 h-32">
            We are well aware of the argument between both light- and dark-mode users. We therefore are proud to present our app in both of these themes, just click the {$theme === 'dark' ? 'sun' : 'moon'} icon and see for yourself.
          </p>
        </div>
      </div>

      <div class="mx-auto xl:my-0 my-20 flex flex-col" id="Phone">
        <Phone bind:this={PhoneComponent} />
      </div>

      <div class="xl:justify-self-start xl:text-left xl:max-w-none w-96 max-w-lg mx-auto justify-center text-center flex flex-col gap-y-10">
        <div>
          <Icon data={faUserSecret} scale="5" class="text-primaryLight dark:text-primaryDark" />
          <h3 class="text-3xl font-bold mt-2">Anonymity</h3>
          <p class="text-lg font-light leading-tight mt-3 h-32">
            Every user has their own PGP keypair, server regards to users only by their hashed public key (called adress or ID). We store no identifiable data about you, relaying server only knows and uses your ID and public key.
          </p>
        </div>
        <div>
          <Icon data={faLock} scale="4" class="text-primaryLight dark:text-primaryDark" />
          <h3 class="text-3xl font-bold mt-2">Privacy</h3>
          <p class="text-lg font-light leading-tight mt-3 h-32">
            Every single message sent (including media) is end-to-end encrypted using, as the name of the app suggests, PGP encryption standard, so the your message's contents are by design totally obscure to us.
          </p>
        </div>
        <div>
          <Icon data={faOsi} scale="4" class="text-primaryLight dark:text-primaryDark" />
          <h3 class="text-3xl font-bold mt-2">Open-source</h3>
          <p class="text-lg font-light leading-tight mt-3 h-32">
            We are firm believers that software should be free and open-source especially one that has to be trusted to handle your data securely. Therefore this whole project is accesible on 
            <a class="font-bold" href="https://github.com/Tarasa24/PGPChatApp" target="_blank">GitHub</a>.
          </p>
        </div>
      </div>
    </div>
  </div>

  <footer class="bg-primaryLight dark:bg-primaryDark text-center py-5 mt-20">
    <span class="text-white">Made with ❤️ by <a href="https://tarasa24.dev" target="_blank" class="font-bold">Tarasa24</a></span>
  </footer>
</main>
