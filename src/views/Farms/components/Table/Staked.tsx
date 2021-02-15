import React, { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { Button } from '@pancakeswap-libs/uikit'
import UnlockButton from 'components/UnlockButton'
import { useWallet } from '@binance-chain/bsc-use-wallet'
import StakeAction from 'views/Farms/components/FarmCard/StakeAction'
import { useFarmUser } from 'state/hooks'
import { FarmWithStakedValue } from 'views/Farms/components/FarmCard/FarmCard'
import useI18n from 'hooks/useI18n'
import { useApprove } from 'hooks/useApprove'
import { getContract } from 'utils/erc20'
import { provider } from 'web3-core'
import { BASE_ADD_LIQUIDITY_URL } from 'config'
import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'

const Container = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;

  button {
    white-space: nowrap;
    color: white;
    height: 32px;
    width: 160px;
    border-radius: 16px;
    padding-left: 0;
    padding-right: 0;
  }
`

const Staked: React.FunctionComponent<FarmWithStakedValue> = ({
  pid,
  lpSymbol,
  lpAddresses,
  quoteTokenAdresses,
  quoteTokenSymbol,
  tokenAddresses,
}) => {
  const TranslateString = useI18n()
  const { account, ethereum } = useWallet()
  const [requestedApproval, setRequestedApproval] = useState(false)
  const { allowance, tokenBalance, stakedBalance } = useFarmUser(pid)
  const isApproved = account && allowance && allowance.isGreaterThan(0)
  const lpAddress = lpAddresses[process.env.REACT_APP_CHAIN_ID]
  const liquidityUrlPathParts = getLiquidityUrlPathParts({ quoteTokenAdresses, quoteTokenSymbol, tokenAddresses })
  const addLiquidityUrl = `${BASE_ADD_LIQUIDITY_URL}/${liquidityUrlPathParts}`

  const lpContract = useMemo(() => {
    return getContract(ethereum as provider, lpAddress)
  }, [ethereum, lpAddress])

  const { onApprove } = useApprove(lpContract)

  const handleApprove = useCallback(async () => {
    try {
      setRequestedApproval(true)
      await onApprove()
      setRequestedApproval(false)
    } catch (e) {
      console.error(e)
    }
  }, [onApprove])

  if (account) {
    if (isApproved) {
      return (
        <Container>
          <StakeAction
            stakedBalance={stakedBalance}
            tokenBalance={tokenBalance}
            tokenName={lpSymbol.toUpperCase()}
            pid={pid}
            addLiquidityUrl={addLiquidityUrl}
          />
        </Container>
      )
    }

    return (
      <Container>
        <Button fullWidth disabled={requestedApproval} onClick={handleApprove}>
          {TranslateString(999, 'Approve Contract')}
        </Button>
      </Container>
    )
  }

  return (
    <Container>
      <UnlockButton />
    </Container>
  )
}

export default Staked
