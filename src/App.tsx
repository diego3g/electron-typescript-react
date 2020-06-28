import React from 'react'
import { render } from 'react-dom'
import { GlobalStyle } from './styles/GlobalStyle'

const mainElement = document.createElement('div')
document.body.appendChild(mainElement)

const App = () => {
  return (
    <>
      <h1>Hello</h1>
      <GlobalStyle />
    </>
  )
}

render(<App />, mainElement)
