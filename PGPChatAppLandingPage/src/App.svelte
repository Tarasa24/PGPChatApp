<script lang="ts">
  import Icon from 'svelte-awesome';
  import {faChevronDown} from '@fortawesome/free-solid-svg-icons'
  import {faComments, faPhone, faMoon, faUserSecret, faLock, faBookOpen} from '@fortawesome/free-solid-svg-icons'

  import Nav from './components/Nav.svelte'
  import Header from './components/Header.svelte'

  import Phone from './components/Phone.svelte'

  let hasHash = Boolean(window.location.hash)

  let PhoneComponent
</script>

<svelte:window on:hashchange={() => hasHash = Boolean(window.location.hash) }/>

<main>
  <Nav />
  <Header />

  <div id="Features" >
    <div class="text-center mx-auto mb-14 xl:mt-0 mt-5 {!hasHash && 'animate-bounce'}">
      <a href="#Features" >
        <Icon data={faChevronDown} scale="3" class="{hasHash && 'text-borderLight'}" />
      </a>
    </div>
  
    <div class="flex xl:flex-row flex-col gap-x-10 mt-14 max-w-6xl mx-auto items-center">
      <div class="xl:justify-self-end xl:text-right xl:max-w-none max-w-lg mx-auto justify-center text-center flex flex-col gap-y-10">
        <div>
          <Icon data={faComments} scale="5" class="text-primaryLight" />
          <h3 class="text-3xl font-bold mt-2">Chat</h3>
          <p class="text-lg font-light leading-tight mt-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut semper mauris at suscipit rhoncus. Proin volutpat nibh eget eros auctor, vehicula ultricies tellus tempor.</p>
        </div>
        <div>
          <Icon data={faPhone} scale="4" class="text-primaryLight" />
          <h3 class="text-3xl font-bold mt-2">Call</h3>
          <p class="text-lg font-light leading-tight mt-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut semper mauris at suscipit rhoncus. Proin volutpat nibh eget eros auctor, vehicula ultricies tellus tempor.</p>
        </div>
        <div>
          <Icon data={faMoon} scale="4" class="text-primaryLight" />
          <h3 class="text-3xl font-bold mt-2">Dark mode</h3>
          <p class="text-lg font-light leading-tight mt-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut semper mauris at suscipit rhoncus. Proin volutpat nibh eget eros auctor, vehicula ultricies tellus tempor.</p>
        </div>
      </div>

      <div class="mx-auto xl:my-0 my-20 flex flex-col" id="Phone">
        <Phone bind:this={PhoneComponent} />
      </div>

      <div class="xl:justify-self-start xl:text-left xl:max-w-none max-w-lg mx-auto justify-center text-center flex flex-col gap-y-10">
        <div>
          <Icon data={faUserSecret} scale="5" class="text-primaryLight" />
          <h3 class="text-3xl font-bold mt-2">Anonymity</h3>
          <p class="text-lg font-light leading-tight mt-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut semper mauris at suscipit rhoncus. Proin volutpat nibh eget eros auctor, vehicula ultricies tellus tempor.</p>
        </div>
        <div>
          <Icon data={faLock} scale="4" class="text-primaryLight" />
          <h3 class="text-3xl font-bold mt-2">Privacy</h3>
          <p class="text-lg font-light leading-tight mt-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut semper mauris at suscipit rhoncus. Proin volutpat nibh eget eros auctor, vehicula ultricies tellus tempor.</p>
        </div>
        <div>
          <Icon data={faBookOpen} scale="4" class="text-primaryLight" />
          <h3 class="text-3xl font-bold mt-2">Open-source</h3>
          <p class="text-lg font-light leading-tight mt-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut semper mauris at suscipit rhoncus. Proin volutpat nibh eget eros auctor, vehicula ultricies tellus tempor.</p>
        </div>
      </div>
    </div>
  </div>

  <footer class="bg-primaryLight text-center py-5 mt-20">
    <span class="text-white">Made with ❤️ by <a href="https://tarasa24.dev" target="_blank" class="font-bold">Tarasa24</a></span>
  </footer>
</main>
