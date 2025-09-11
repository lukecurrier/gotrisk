import { Territory } from "../Board/Territory";
import { Player } from "../Player";
import { Token } from "../../utils/Utils";
import { beforeEach, describe, it } from "node:test";
import { expect, test } from 'vitest';

describe("Territory", () => {
  let territoryA: Territory;
  let territoryB: Territory;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    territoryA = new Territory("A", true, false, false);
    territoryB = new Territory("B", false, false, false);
    territoryA.addNeighbor(territoryB); 

    player1 = new Player(1, "Player 1", "blue");
    player2 = new Player(2, "Player 2", "green");

    territoryA.changeOwner(player1);
    territoryB.changeOwner(player2);
  });

  it("initializes with correct properties", () => {
    expect(territoryA.getTroops()).toBe(1);
    expect(territoryA.coastal).toBe(true);
    expect(territoryA.port).toBe(false);
    expect(territoryA.castle).toBe(false);
  });

  it("throws if getting owner before set", () => {
    const orphan = new Territory("C", false, false, false);
    expect(() => orphan.getOwner()).toThrow("No owner!");
  });

  it("canAttack returns true if adjacent, enemy-owned, and >1 troop", () => {
    territoryA.placeTroops(2);
    expect(territoryA.canAttack(territoryB)).toBe(true);
  });

  it("canAttack returns false if not enough troops", () => {
    expect(territoryA.canAttack(territoryB)).toBe(false);
  });

  it("placeTroops and removeTroops works", () => {
    territoryA.placeTroops(3);
    expect(territoryA.getTroops()).toBe(4);

    territoryA.removeTroops(2);
    expect(territoryA.getTroops()).toBe(2);

    expect(() => territoryA.removeTroops(5)).toThrow("Not enough troops to remove!");
  });

  it("placeTokens and removeTokens works", () => {
    territoryA.placeTokens(1, 2, 3);
    let removed = territoryA.removeTokens([Token.Fortification, Token.Knight]);
    expect(removed).toEqual({ castlesRemoved: 1, knightsRemoved: 2, enginesRemoved: 0 });

    removed = territoryA.removeTokens([Token.SiegeEngine]);
    expect(removed.enginesRemoved).toBe(3);
  });

  it("placeCapital sets player capitol and adds troops", () => {
    territoryA.placeCapital();
    expect(territoryA.getCapital()).toBe(player1);
    expect(territoryA.getTroops()).toBe(3);
    expect(player1.getCapital()).toBe(territoryA);
  });

  it("changeOwner assigns new owner and resets troops", () => {
    territoryA.changeOwner(player2);
    expect(territoryA.getOwner()).toBe(player2);
    expect(territoryA.getTroops()).toBe(0);
  });
});
