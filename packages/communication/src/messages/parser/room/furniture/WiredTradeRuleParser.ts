import { IWiredContractDefinition, IWiredContractNode, IWiredContractRule, readWiredContractDefinition, readWiredContractRule } from '../../roomevents/WiredContractData';

/** TradeRequirementNode types (AIR package_231/TradeRequirementNode: byte type). */
export const WIRED_TRADE_NODE_COINS = 0;
export const WIRED_TRADE_NODE_FURNI = 1;

/**
 * One thing a trade asks for or hands back: a pile of coins, or a pile of one kind of furni. Same wire shape as the
 * contract editor's node (AIR TradeRequirementNode): byte type, int amount, if furni: bool wall, int typeId,
 * string posterId.
 */
export type IWiredTradeNode = IWiredContractNode;

/** Nodes inside a rule are joined (all must be met); alternative rules are or-ed. */
export type IWiredTradeRule = IWiredContractRule;

/** AIR TradeRequirementRulesDefinition: bool hasGive, [int n, rule[n]], bool hasGet, [rule]. */
export type IWiredTradeRulesDefinition = IWiredContractDefinition;

export const readWiredTradeRule = readWiredContractRule;
export const readWiredTradeRulesDefinition = readWiredContractDefinition;
