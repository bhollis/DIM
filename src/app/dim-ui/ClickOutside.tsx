import React from 'react';
import { Subscriptions } from '../utils/rx-utils';
import { Subject } from 'rxjs';

export const ClickOutsideContext = React.createContext(new Subject<React.MouseEvent>());

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  innerRef?(node: HTMLElement): void;
  onClickOutside(event: React.MouseEvent): void;
}

/**
 * Component that fires an event if you click or tap outside of it.
 */
// TODO: Use a context in order to use the React event system everywhere
export default class ClickOutside extends React.Component<Props> {
  static contextType = ClickOutsideContext;
  context!: React.ContextType<typeof ClickOutsideContext>;
  private wrapperRef: HTMLDivElement | null = null;
  private subscriptions = new Subscriptions();

  componentDidMount() {
    this.subscriptions.add(this.context.subscribe(this.handleClickOutside));
  }

  componentWillUnmount() {
    this.subscriptions.unsubscribe();
  }

  render() {
    const { onClickOutside, ...other } = this.props;

    return (
      <div ref={this.setRef} {...other}>
        {this.props.children}
      </div>
    );
  }

  private setRef = (elem: HTMLDivElement) => {
    this.wrapperRef = elem;
    if (this.props.innerRef) {
      this.props.innerRef(elem);
    }
  };

  /**
   * Alert if clicked on outside of element
   */
  private handleClickOutside = (event: React.MouseEvent) => {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target as Node)) {
      this.props.onClickOutside(event);
    }
  };
}
