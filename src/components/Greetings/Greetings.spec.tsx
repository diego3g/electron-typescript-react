import React from 'react'
import { render } from '@testing-library/react'

import Greetings from './index'

test('Greetings should renders', () => {
  const { getByText } = render(<Greetings />)

  expect(
    getByText('An Electron boilerplate including TypeScript, React, Jest and ESLint.')
  ).toBeTruthy()
})
