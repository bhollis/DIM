import React from 'react';
import { DimItem } from '../inventory/item-types';
import { ItemPickerState } from './item-picker';
import Sheet from '../dim-ui/Sheet';
import ConnectedInventoryItem from '../inventory/ConnectedInventoryItem';
import { connect, MapStateToProps } from 'react-redux';
import { RootState } from '../store/reducers';
import { createSelector } from 'reselect';
import { storesSelector } from '../inventory/reducer';
import {
  SearchConfig,
  searchConfigSelector,
  SearchFilters,
  searchFiltersConfigSelector
} from '../search/search-filters';
import SearchFilterInput from '../search/SearchFilterInput';
import { sortItems } from '../shell/filters';
import { itemSortOrderSelector } from '../settings/item-sort';
import classNames from 'classnames';
import { t } from 'app/i18next-t';
import styles from './ItemPicker.m.scss';
import { setSetting } from '../settings/actions';

type ProvidedProps = ItemPickerState & {
  onSheetClosed(): void;
};

interface StoreProps {
  allItems: DimItem[];
  searchConfig: SearchConfig;
  filters: SearchFilters;
  itemSortOrder: string[];
  isPhonePortrait: boolean;
  preferEquip: boolean;
}

function mapStateToProps(): MapStateToProps<StoreProps, ProvidedProps, RootState> {
  const filteredItemsSelector = createSelector(
    storesSelector,
    (_: RootState, ownProps: ProvidedProps) => ownProps.filterItems,
    (stores, filterItems) =>
      stores.flatMap((s) => (filterItems ? s.items.filter(filterItems) : s.items))
  );

  return (state, ownProps) => ({
    allItems: filteredItemsSelector(state, ownProps),
    searchConfig: searchConfigSelector(state),
    filters: searchFiltersConfigSelector(state),
    itemSortOrder: itemSortOrderSelector(state),
    isPhonePortrait: state.shell.isPhonePortrait,
    preferEquip: state.settings.itemPickerEquip
  });
}

const mapDispatchToProps = {
  setSetting
};
type DispatchProps = typeof mapDispatchToProps;

type Props = ProvidedProps & StoreProps & DispatchProps;

interface State {
  query: string;
  equip: boolean;
  height?: number;
}

class ItemPicker extends React.Component<Props, State> {
  state: State = {
    query: '',
    equip: this.props.equip === undefined ? this.props.preferEquip : this.props.equip
  };
  private itemContainer = React.createRef<HTMLDivElement>();
  private filterInput = React.createRef<SearchFilterInput>();

  componentDidMount() {
    if (this.itemContainer.current) {
      this.setState({ height: this.itemContainer.current.clientHeight });
    }
    // On iOS at least, focusing the keyboard pushes the content off the screen
    if (!this.props.isPhonePortrait && this.filterInput.current) {
      this.filterInput.current.focusFilterInput();
    }
  }

  componentDidUpdate() {
    if (this.itemContainer.current && !this.state.height) {
      this.setState({ height: this.itemContainer.current.clientHeight });
    }
  }

  render() {
    const { allItems, prompt, searchConfig, filters, itemSortOrder } = this.props;
    const { query, equip, height } = this.state;

    const list = true;

    const header = (
      <div>
        <h1 className="destiny">{prompt || t('ItemPicker.ChooseItem')}</h1>
        <div className={styles.search}>
          <SearchFilterInput
            ref={this.filterInput}
            searchConfig={searchConfig}
            placeholder="Search items"
            onQueryChanged={this.onQueryChanged}
          />
          <div className="split-buttons">
            <button
              className={classNames('dim-button', { selected: equip })}
              onClick={this.setEquip}
            >
              {t('MovePopup.Equip')}
            </button>
            <button
              className={classNames('dim-button', { selected: !equip })}
              onClick={this.setStore}
            >
              {t('MovePopup.Store')}
            </button>
          </div>
          <div className="split-buttons">
            <button
              className={classNames('dim-button', { selected: !list })}
              onClick={this.setEquip}
            >
              {t('ItemPicker.Compact')}
            </button>
            <button
              className={classNames('dim-button', { selected: list })}
              onClick={this.setStore}
            >
              {t('ItemPicker.List')}
            </button>
          </div>
        </div>
      </div>
    );

    const filter = filters.filterFunction(query);

    const items = sortItems(allItems.filter(filter), itemSortOrder);

    return (
      <Sheet onClose={this.onSheetClosed} header={header} sheetClassName={styles.itemPicker}>
        {({ onClose }) => (
          <div className="sub-bucket" ref={this.itemContainer} style={{ height }}>
            {items.map((item) =>
              list ? (
                <div
                  className={styles.itemTile}
                  key={item.index}
                  onClick={() => this.onItemSelected(item, onClose)}
                >
                  <ConnectedInventoryItem item={item} />
                  {item.name}
                </div>
              ) : (
                <ConnectedInventoryItem
                  key={item.index}
                  item={item}
                  onClick={() => this.onItemSelected(item, onClose)}
                />
              )
            )}
          </div>
        )}
      </Sheet>
    );
  }

  private onQueryChanged = (query: string) => this.setState({ query });

  private onItemSelected = (item: DimItem, onClose: () => void) => {
    this.props.onItemSelected({ item, equip: this.state.equip });
    onClose();
  };

  private onSheetClosed = () => {
    this.props.onCancel();
    this.props.onSheetClosed();
  };

  private setEquip = () => {
    this.setState({ equip: true });
    this.props.setSetting('itemPickerEquip', true);
  };
  private setStore = () => {
    this.setState({ equip: false });
    this.props.setSetting('itemPickerEquip', false);
  };
}

export default connect<StoreProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ItemPicker);
