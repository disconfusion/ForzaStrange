import {Streak} from '../../Classes/Streak.js'

/**
 * Double linked list item.
 */
export class Item {
  /**
   * The following item or `null` otherwise.
   *
   * @type {this|null}
   */
  next: Item | null = null;
  /**
   * The preceding item or `null` otherwise.
   *
   * @type {this|null}
   */
  prev: Item | null = null;
  /**
   * The streak object or `null` otherwise.
   *
   * @type {Streak|null}
   */
  streak: Streak | null = null;
 /**
   * The list this item belongs to or `null` otherwise.
   *
   * @type {List<this>|null}
   */
  list: List<Item> | null = null;
  
constructor(streak: Streak | null = null){
    this.streak = streak;
  }

  /**
   * Add the given item **after** the operated on item in a list.
   *
   * Throws an error when the given item has no `detach`, `append`, or
   * `prepend` methods.
   * Returns `false` when the operated on item is not attached to a list,
   * otherwise the given item.
   *
   * @param {this} item
   * @returns {this|false}
   */
  append(item: Item): false | Item
  /**
   * Add the given item **before** the operated on item in a list.
   *
   * Throws an error when the given item has no `detach`, `append`, or `prepend`
   * methods.
   * Returns `false` when the operated on item is not attached to a list,
   * otherwise the given item.
   *
   * @param {this} item
   * @returns {this|false}
   */
  prepend(item: Item): false | Item
  /**
   * Remove the operated on item from its parent list.
   *
   * Removes references to it on its parent `list`, and `prev` and `next`
   * items.
   * Relinks all references.
   * Returns the operated on item.
   * Even when it was already detached.
   *
   * @returns {this}
   */
  detach(): this
}
/**
 * Double linked list.
 *
 * @template {Item} [T=Item]
 * @implements {Iterable<T>}
 */
export class List<T extends Item = Item> implements Iterable<T> {
  /**
   * Create a new `this` from the given array of items.
   *
   * Ignores `null` or `undefined` values.
   * Throws an error when a given item has no `detach`, `append`, or `prepend`
   * methods.
   *
   * @template {Item} [T=Item]
   * @param {Array<T|null|undefined>} [items]
   */
  static from<T_1 extends Item = Item>(
    items?: (T_1 | null | undefined)[] | undefined
  ): List<T_1>
  /**
   * Create a new `this` from the given arguments.
   *
   * Ignores `null` or `undefined` values.
   * Throws an error when a given item has no `detach`, `append`, or `prepend`
   * methods.
   *
   * @template {Item} [T=Item]
   * @param {Array<T|null|undefined>} items
   * @returns {List<T>}
   */
  static of<T_2 extends Item = Item>(
    ...items: (T_2 | null | undefined)[]
  ): List<T_2>
  /**
   * Create a new list from the given items.
   *
   * Ignores `null` or `undefined` values.
   * Throws an error when a given item has no `detach`, `append`, or `prepend`
   * methods.
   *
   * @param {Array<T|null|undefined>} items
   */
  constructor(...items: Array<T | null | undefined>)
  /**
   * The number of items in the list.
   *
   * @type {number}
   */
  size: number
  /**
   * The first item in a list or `null` otherwise.
   *
   * @type {T|null}
   */
  head: T | null
  /**
   * The last item in a list and `null` otherwise.
   *
   * > 👉 **Note**: a list with only one item has **no tail**, only a head.
   *
   * @type {T|null}
   */
  tail: T | null
  /**
   * Append an item to a list.
   *
   * Throws an error when the given item has no `detach`, `append`, or `prepend`
   * methods.
   * Returns the given item.
   *
   * @param {T|null|undefined} [item]
   * @returns {T|false}
   */
  append(item?: T | null | undefined): T | false
  /**
   * Prepend an item to a list.
   *
   * Throws an error when the given item has no `detach`, `append`, or `prepend`
   * methods.
   * Returns the given item.
   *
   * @param {T|null|undefined} [item]
   * @returns {T|false}
   */
  prepend(item?: T | null | undefined): T | false
  /**
   * Returns the items of the list as an array.
   *
   * This does *not* detach the items.
   *
   * > **Note**: `List` also implements an iterator.
   * > That means you can also do `[...list]` to get an array.
   */
  toArray(): T[]
  /**
   * Creates an iterator from the list.
   *
   * @returns {ItemIterator<T>}
   */
  [Symbol.iterator](): ItemIterator<T>
}
/**
 * Creates an iterator that iterates over a list (through an item).
 *
 * @template {Item} [T=Item]
 */
declare class ItemIterator<T extends Item = Item> {
  /**
   * Create a new iterator.
   *
   * @param {T|null} item
   */
  constructor(item: T | null)
  /** @type {T|null} */
  item: T | null
  /**
   * Move to the next item.
   *
   * @returns {IteratorResult<T, null>}
   */
  next(): IteratorResult<T, null>
}
export {}
