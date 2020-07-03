import React from 'react'

import { Container, Image, Text } from './styles'
import logo from '../../assets/logo.svg'

const Greetings: React.FC = () => {
  return (
    <Container>
      <Image
        src={logo}
        alt="ReactJS logo"
      />
      <Text>An Electron boilerplate including TypeScript, React, Jest and ESLint.</Text>
    </Container>
  )
}

export default Greetings
