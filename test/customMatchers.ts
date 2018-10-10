import MatchersUtil = jasmine.MatchersUtil;
import CustomMatcherFactories = jasmine.CustomMatcherFactories;
import CustomEqualityTester = jasmine.CustomEqualityTester;
import CustomMatcher = jasmine.CustomMatcher;
import CustomMatcherResult = jasmine.CustomMatcherResult;

export interface IToHaveOrder {
  predecessor:string,
  successor:string
}

export interface CustomArrayLikeMatchers extends jasmine.ArrayLikeMatchers<string> {
  toHaveOrder(expected:any, expectationFailOutput?:any): boolean;
}

export const CustomMatchers:CustomMatcherFactories = {
  toHaveOrder: function (util: MatchersUtil, customEqualityTester: CustomEqualityTester[]): CustomMatcher {
    return {
      compare: function (actual:any, expected:IToHaveOrder): CustomMatcherResult {
        let iPredecessor = actual.indexOf(expected.predecessor);
        let iSuccessor = actual.indexOf(expected.successor);

        if (0 <= iPredecessor && iPredecessor < iSuccessor) {
          return {
            pass: true,
            message: expected.predecessor + " precedes " + expected.successor
          }
        } else {
          return {
            pass: false,
            message: "Expected " + expected.predecessor + " to precede " + expected.successor
          }
        }
      }
    }
  }
}