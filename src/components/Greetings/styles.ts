import styled, { keyframes } from 'styled-components'

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

  button {
    margin-top: 24px;
  }
`

export const Image = styled.img`
  width: 240px;
  animation: ${rotate} 15s linear infinite;
`

export const Text = styled.p`
  margin-top: 24px;
  font-size: 18px;
`
