import React, { useContext } from 'react'
import { render } from 'react-dom'
import { GlobalStyle } from './styles/GlobalStyle'
import { Select, Option } from './components/Select'

import Greetings from './components/Greetings'
import {
  DiscordClientContext,
  DiscordClientProvider
} from './components/DiscordClientContext'

const mainElement = document.createElement('div')
mainElement.setAttribute('id', 'root')
document.body.appendChild(mainElement)

const WrappedComponent = () => {
  const client = useContext(DiscordClientContext)
  if (client) {
    console.log(client)
  }
  return <div>Hello!</div>
}

const App = () => {
  return (
    <DiscordClientProvider>
      <GlobalStyle />
      <Select>
        <Option value="value1">Value 1</Option>
        <Option value="value2">Value 2</Option>
        <div>Hello world!</div>
      </Select>
      <WrappedComponent />
    </DiscordClientProvider>
  )
}

render(<App />, mainElement)
