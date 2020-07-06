import styled, { keyframes } from 'styled-components'
import { ReactComponent as ReactLogo } from '../../assets/logo.svg'

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

export const Container = styled.div`
    height: 100vh;
    padding: 25px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`

export const Logo = styled(ReactLogo)`
    width: 300px;
    height: 300px;
    animation: ${rotate} 15s linear infinite;
    opacity: 0.1;
`
export const Text = styled.p`
    margin-top: 35px;
    font-size: 20px;
    font-weight: bold;
`
