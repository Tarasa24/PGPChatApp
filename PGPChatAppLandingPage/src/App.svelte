<script lang="ts">
  import Icon from 'svelte-awesome';
  import {faChevronDown, faSun} from '@fortawesome/free-solid-svg-icons'
  import {faComments, faPhone, faMoon, faUserSecret, faLock, faBookOpen} from '@fortawesome/free-solid-svg-icons'
  import { theme } from '../src/store'

  import Nav from './components/Nav.svelte'
  import Header from './components/Header.svelte'

  import Phone from './components/Phone.svelte'

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
      <div class="xl:justify-self-end xl:text-right xl:max-w-none max-w-lg mx-auto justify-center text-center flex flex-col gap-y-10">
        <div>
          <Icon data={faComments} scale="5" class="text-primaryLight dark:text-primaryDark" />
          <h3 class="text-3xl font-bold mt-2">Chat</h3>
          <p class="text-lg font-light leading-tight mt-3">
            We offer standard IM app functions such as sending text messages, gifs and other media (upto X MB). On top of that you can find various fun "features" in each chat window.
          </p>
        </div>
        <div>
          <Icon data={faPhone} scale="4" class="text-primaryLight dark:text-primaryDark" />
          <h3 class="text-3xl font-bold mt-2">Call</h3>
          <p class="text-lg font-light leading-tight mt-3">
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
          <p class="text-lg font-light leading-tight mt-3">
            We are well aware of the argument between both light- and dark-mode users. And therefore we are proud to present our app in both of these themes, just click the {$theme === 'dark' ? 'sun' : 'moon'} icon and see for yourself.
          </p>
        </div>
      </div>

      <div class="mx-auto xl:my-0 my-20 flex flex-col" id="Phone">
        <Phone bind:this={PhoneComponent} />
      </div>

      <div class="xl:justify-self-start xl:text-left xl:max-w-none max-w-lg mx-auto justify-center text-center flex flex-col gap-y-10">
        <div>
          <Icon data={faUserSecret} scale="5" class="text-primaryLight dark:text-primaryDark" />
          <h3 class="text-3xl font-bold mt-2">Anonymity</h3>
          <p class="text-lg font-light leading-tight mt-3">
            Every new user is generated unique adress (regarded as ID), which is esentially your public key hashed in the same way as BitCoin does. Users can assign names to their contacts locally but as far as the relay server is concerned it just know that this ID send message to that ID.
          </p>
        </div>
        <div>
          <Icon data={faLock} scale="4" class="text-primaryLight dark:text-primaryDark" />
          <h3 class="text-3xl font-bold mt-2">Privacy</h3>
          <p class="text-lg font-light leading-tight mt-3">
            Every single message sent (including media) is end-to-end encrypted and as the name of the app suggests it's done by using PGP encryption standard, so the contents are by design totaly obsured to us.
          </p>
        </div>
        <div>
          <Icon data={faBookOpen} scale="4" class="text-primaryLight dark:text-primaryDark" />
          <h3 class="text-3xl font-bold mt-2">Open-source</h3>
          <p class="text-lg font-light leading-tight mt-3">
            We are firm believers that any software that needs to be trusted should be developed as open-source. Therefore this whole project including the app, server, even this very website has been developed as such and is freely accesible on 
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
