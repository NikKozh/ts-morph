﻿import * as ts from "typescript";
import {expect} from "chai";
import {ArrayLiteralExpression, VariableStatement} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ArrayLiteralExpression), () => {
    function getArrayLiteralExpression(text: string) {
        const opts = getInfoFromText<VariableStatement>(text);
        const declaration = opts.firstChild.getDeclarations()[0];
        return {
            arrayLiteralExpression: declaration.getFirstChildByKindOrThrow(ts.SyntaxKind.ArrayLiteralExpression) as ArrayLiteralExpression,
            ...opts
        };
    }

    describe(nameof<ArrayLiteralExpression>(e => e.getElements), () => {
        function doTest(text: string, elementTexts: string[]) {
            const {arrayLiteralExpression} = getArrayLiteralExpression(text);
            expect(arrayLiteralExpression.getElements().map(e => e.getText())).to.deep.equal(elementTexts);
        }

        it("should get the elements when there are none", () => {
            doTest("var t = []", []);
        });

        it("should get the elements when there are some", () => {
            doTest("var t = [5, 3, 'test']", ["5", "3", "'test'"]);
        });
    });

    describe(nameof<ArrayLiteralExpression>(e => e.insertElements), () => {
        function doTest(text: string, index: number, elementTexts: string[], expectedText: string) {
            const {arrayLiteralExpression, sourceFile} = getArrayLiteralExpression(text);
            const result = arrayLiteralExpression.insertElements(index, elementTexts);
            expect(result.map(r => r.getText())).to.deep.equal(elementTexts);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should insert into an empty array", () => {
            doTest("var t = []", 0, ["5", "3", "'test'"], "var t = [5, 3, 'test']");
        });

        it("should insert in at the start of the array", () => {
            doTest("var t = [3, 4]", 0, ["1", "2"], "var t = [1, 2, 3, 4]");
        });

        it("should insert in the middle of the array", () => {
            doTest("var t = [1, 4]", 1, ["2", "3"], "var t = [1, 2, 3, 4]");
        });

        it("should insert in at the end of the array", () => {
            doTest("var t = [1, 2]", 2, ["3", "4"], "var t = [1, 2, 3, 4]");
        });
    });

    describe(nameof<ArrayLiteralExpression>(e => e.insertElement), () => {
        function doTest(text: string, index: number, elementText: string, expectedText: string) {
            const {arrayLiteralExpression, sourceFile} = getArrayLiteralExpression(text);
            const result = arrayLiteralExpression.insertElement(index, elementText);
            expect(result.getText()).to.equal(elementText);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should insert into an empty array", () => {
            doTest("var t = []", 0, "1", "var t = [1]");
        });

        it("should insert in at the start of the array", () => {
            doTest("var t = [2, 3]", 0, "1", "var t = [1, 2, 3]");
        });

        it("should insert in the middle of the array", () => {
            doTest("var t = [1, 3]", 1, "2", "var t = [1, 2, 3]");
        });

        it("should insert in at the end of the array", () => {
            doTest("var t = [1, 2]", 2, "3", "var t = [1, 2, 3]");
        });
    });

    describe(nameof<ArrayLiteralExpression>(e => e.addElements), () => {
        function doTest(text: string, elementTexts: string[], expectedText: string) {
            const {arrayLiteralExpression, sourceFile} = getArrayLiteralExpression(text);
            const result = arrayLiteralExpression.addElements(elementTexts);
            expect(result.map(r => r.getText())).to.deep.equal(elementTexts);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should add into an empty array", () => {
            doTest("var t = []", ["1", "2", "3"], "var t = [1, 2, 3]");
        });

        it("should add at the end of the array", () => {
            doTest("var t = [1, 2]", ["3", "4"], "var t = [1, 2, 3, 4]");
        });
    });

    describe(nameof<ArrayLiteralExpression>(e => e.addElement), () => {
        function doTest(text: string, elementText: string, expectedText: string) {
            const {arrayLiteralExpression, sourceFile} = getArrayLiteralExpression(text);
            const result = arrayLiteralExpression.addElement(elementText);
            expect(result.getText()).to.equal(elementText);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should add into an empty array", () => {
            doTest("var t = []", "1", "var t = [1]");
        });

        it("should add at the end of the array", () => {
            doTest("var t = [1, 2]", "3", "var t = [1, 2, 3]");
        });
    });

    describe(nameof<ArrayLiteralExpression>(e => e.removeElement), () => {
        it("should throw when none exist", () => {
            const {arrayLiteralExpression, sourceFile} = getArrayLiteralExpression("var t = []");
            expect(() => arrayLiteralExpression.removeElement(0)).to.throw();
        });

        it("should throw when specifying an invalid index", () => {
            const {arrayLiteralExpression, sourceFile} = getArrayLiteralExpression("var t = [1]");
            expect(() => arrayLiteralExpression.removeElement(1)).to.throw();
        });

        describe("index", () => {
            function doTest(text: string, index: number, expectedText: string) {
                const {arrayLiteralExpression, sourceFile} = getArrayLiteralExpression(text);
                arrayLiteralExpression.removeElement(index);
                expect(sourceFile.getFullText()).to.equal(expectedText);
            }

            it("should remove at the start", () => {
                doTest("var t = [1, 2, 3]", 0, "var t = [2, 3]");
            });

            it("should remove in the middle", () => {
                doTest("var t = [1, 2, 3]", 1, "var t = [1, 3]");
            });

            it("should remove at the end", () => {
                doTest("var t = [1, 2, 3]", 2, "var t = [1, 2]");
            });
        });

        describe("element", () => {
            function doTest(text: string, index: number, expectedText: string) {
                const {arrayLiteralExpression, sourceFile} = getArrayLiteralExpression(text);
                arrayLiteralExpression.removeElement(arrayLiteralExpression.getElements()[index]);
                expect(sourceFile.getFullText()).to.equal(expectedText);
            }

            it("should remove by element", () => {
                doTest("var t = [1, 2, 3]", 1, "var t = [1, 3]");
            });
        });
    });
});
