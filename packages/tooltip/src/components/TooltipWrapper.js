/*
 * This file is part of the nivo project.
 *
 * Copyright 2016-present, Raphaël Benitte.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import React, { memo, useMemo, useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import Measure from 'react-measure'
import { useSpring, animated } from 'react-spring'
import { useTheme, useMotionConfig } from '@nivo/core'

const TOOLTIP_OFFSET = 14

const tooltipStyle = {
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: 10,
    top: 0,
    left: 0,
}

const TooltipWrapper = memo(({ position, anchor, children }) => {
    const theme = useTheme()
    const { animate, config: springConfig } = useMotionConfig()

    const [dimensions, setDimensions] = useState(null)
    const previousDimensions = useRef(null)
    useEffect(() => {
        previousDimensions.current = dimensions
    })

    let x = Math.round(position[0])
    let y = Math.round(position[1])
    if (dimensions !== null) {
        if (anchor === 'top') {
            x -= dimensions[0] / 2
            y -= dimensions[1] + TOOLTIP_OFFSET
        } else if (anchor === 'right') {
            x += TOOLTIP_OFFSET
            y -= dimensions[1] / 2
        } else if (anchor === 'bottom') {
            x -= dimensions[0] / 2
            y += TOOLTIP_OFFSET
        } else if (anchor === 'left') {
            x -= dimensions[0] + TOOLTIP_OFFSET
            y -= dimensions[1] / 2
        } else if (anchor === 'center') {
            x -= dimensions[0] / 2
            y -= dimensions[1] / 2
        }
    }

    const isInitializing = dimensions === null || previousDimensions.current === null

    const animatedProps = useSpring({
        transform: `translate(${x}px, ${y}px)`,
        config: springConfig,
        immediate: !animate || isInitializing,
    })

    const style = useMemo(
        () => ({
            ...tooltipStyle,
            ...theme.tooltip,
            opacity: isInitializing ? 0 : 1,
        }),
        [dimensions, theme.tooltip, isInitializing]
    )

    // if we don't have dimensions yet, we use
    // the non animated version with a 0 opacity
    // to avoid a flash effect and weird initial transition
    return (
        <Measure
            client={false}
            offset={false}
            bounds={true}
            margin={false}
            onResize={({ bounds }) => {
                setDimensions([bounds.width, bounds.height])
            }}
        >
            {({ measureRef }) => {
                return (
                    <animated.div
                        ref={measureRef}
                        style={{
                            ...style,
                            ...animatedProps,
                        }}
                    >
                        {children}
                    </animated.div>
                )
            }}
        </Measure>
    )
})

TooltipWrapper.displayName = 'TooltipWrapper'
TooltipWrapper.propTypes = {
    position: PropTypes.array.isRequired,
    anchor: PropTypes.oneOf(['top', 'right', 'bottom', 'left', 'center']).isRequired,
    children: PropTypes.node.isRequired,
}
TooltipWrapper.defaultProps = {
    anchor: 'top',
}

export default TooltipWrapper
