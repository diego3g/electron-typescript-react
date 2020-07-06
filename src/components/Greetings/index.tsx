import React from 'react'

import { Container, Text, Logo } from './styles'

const Greetings: React.FC = () => {
  return (
    <Container>
      <Logo/>
      <Text>An Electron boilerplate including TypeScript, React, Jest and ESLint.</Text>
    </Container>
  )
}

export default Greetings
