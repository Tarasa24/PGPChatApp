import { writable } from 'svelte/store'

export const theme = writable(localStorage.getItem('theme'))

theme.subscribe((value) => {
  localStorage.setItem('theme', value === 'dark' ? 'dark' : 'light')
  if (value === 'dark') document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')
})
