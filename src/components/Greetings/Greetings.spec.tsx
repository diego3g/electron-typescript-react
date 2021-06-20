import { render } from '@testing-library/react'

import { Greetings } from './index'

test('Greetings should renders', () => {
  const { getByText, getByAltText } = render(<Greetings />)

  expect(
    getByText('An Electron boilerplate including TypeScript, React, Jest and ESLint.')
  ).toBeTruthy()
  expect(getByAltText('ReactJS logo')).toBeTruthy()
})
