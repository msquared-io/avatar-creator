/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

export type ConditionData = {
  parameterName: string;
  predicate: string;
  value: boolean;
};

export type StateData = {
  name: string;
  speed?: number;
  loop?: boolean;
  defaultState?: boolean;
};

export type TransitionData = {
  from: string;
  to: string;
  edgeType: number;
  conditions: Array<ConditionData>;
  defaultTransition?: boolean;
  exitTime?: number;
  time?: number;
  interruptionSource?: string;
};

export type LayerData = {
  name: string;
  states: Array<StateData>;
  transitions: Array<TransitionData>;
};

export type ParameterData = {
  name: string;
  type: string;
  value: boolean;
};

export type ParametersData = Record<string, ParameterData>;

export type AnimGraphData = {
  layers: Array<LayerData>;
  parameters: ParametersData;
};

export const generateDefaultAnimGraph = (): AnimGraphData => {
  return {
    layers: [
      {
        name: "default",
        states: [
          {
            name: "START",
          },
          {
            name: "ANY",
          },
          {
            name: "Idle",
            speed: 1,
            loop: true,
            defaultState: true,
          },
        ],
        transitions: [
          {
            from: "START",
            to: "Idle",
            defaultTransition: true,
            edgeType: 1,
            conditions: [],
          },
        ],
      },
    ],
    parameters: {},
  };
};

export const addAnimationData = (animGraph: AnimGraphData, name: string) => {
  const layer = animGraph.layers[0];

  // state
  layer.states.push({
    name,
    speed: 1,
    loop: false,
    defaultState: false,
  });

  // transition in
  layer.transitions.push({
    from: "ANY",
    to: name,
    exitTime: 0,
    time: 0.1,
    interruptionSource: "NONE",
    edgeType: 1,
    conditions: [
      {
        parameterName: name,
        predicate: "EQUAL_TO",
        value: true,
      },
    ],
  });

  // transition out
  layer.transitions.push({
    from: name,
    to: "Idle",
    exitTime: 0.9,
    interruptionSource: "NONE",
    edgeType: 1,
    conditions: [],
    time: 0.1,
  });

  // trigger
  animGraph.parameters[name] = {
    name,
    type: "TRIGGER",
    value: false,
  };
};
