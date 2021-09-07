<script lang="ts">
  import InlineSVG from 'svelte-inline-svg'
  import Waves from '../assets/Waves.svg';

  import Icon from 'svelte-awesome';
  import { faGithub } from '@fortawesome/free-brands-svg-icons';
</script>

<header>
  <div class="bg-primaryLight w-100 flex flex-col z-10 pt-[35vh]">
    <h1 class="text-center text-white font-bold lg:text-6xl text-4xl mx-2.5 mb-10">Chat Securely Through The Power Of PGP Encryption</h1>
    <h2 class="text-center text-borderLight lg:text-3xl text-2xl font-light mx-2.5 mb-5">Meet <b>PGPChatApp</b>, open-source privacy-first feature-rich experience.</h2>

    <div class="flex lg:mb-0 mb-6">
      <a href="https://github.com/Tarasa24/PGPChatApp/releases" target="_blank" class="mx-auto mt-20">
        <div class="bg-black px-2 py-1 rounded-3xl flex cursor-pointer transition-transform hover:scale-105">
          <Icon data={faGithub} scale="3.25" class="text-white mr-3" />
          <div class="flex flex-col justify-center items-center mr-2">
            <span class="text-white text-xs">Download exclusively on</span>
            <b class="text-white text-3xl">GitHub</b>
          </div>
        </div>
      </a>
    </div>
  </div>
  <InlineSVG src={Waves} class="w-[100%] h-[100%]" />
</header>
