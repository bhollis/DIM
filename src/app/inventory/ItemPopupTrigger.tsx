import React from 'react';
import { DimItem } from './item-types';
import { dimLoadoutService } from '../loadout/loadout.service';
import { CompareService } from '../compare/compare.service';
import { NewItemsService } from './store/new-items';
import { showItemPopup, ItemPopupExtraInfo } from '../item-popup/item-popup';

interface Props {
  item: DimItem;
  extraData?: ItemPopupExtraInfo;
  /** This is a dirty hack to bypass the compare/loadout logic for items that are already in a drawer. */
  alwaysShowPopup?: boolean;
  /**
   * Children should be a function that takes a ref and an onClick function, and applies them
   * to the right elements. ref should be set on the item that will anchor the popup, and
   * onClick should be set on whatever can be clicked to show the popup.
   */
  children(ref: React.Ref<HTMLDivElement>, onClick: (e: React.MouseEvent) => void): React.ReactNode;
}

/**
 * This wraps its children in a div which, when clicked, will show the move popup for the provided item.
 */
export default class ItemPopupTrigger extends React.Component<Props> {
  private ref = React.createRef<HTMLDivElement>();

  render() {
    const { children } = this.props;

    return children(this.ref, this.clicked);
  }

  private clicked = (e: React.MouseEvent) => {
    e.stopPropagation();

    const { item, extraData, alwaysShowPopup } = this.props;

    NewItemsService.dropNewItem(item);

    // TODO: a dispatcher based on store state?
    if (!alwaysShowPopup && dimLoadoutService.dialogOpen) {
      dimLoadoutService.addItemToLoadout(item, e);
    } else if (!alwaysShowPopup && CompareService.dialogOpen) {
      CompareService.addItemsToCompare([item]);
    } else {
      showItemPopup(item, this.ref.current!, extraData);
      return false;
    }
  };
}
