import { css } from 'lit-element';

export default css`
  .form-item {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  :host([narrow]) .form-item,
  .narrow .form-item {
    display: block;
  }

  .form-item[data-optional] {
    display: none;
  }

  :host([optionalOpened]) [data-optional] {
    display: flex;
    flex-direction: row;
  }
  /* styling form inline markdown */
  arc-marked {
    background-color: var(--inline-documentation-background-color, #fff3e0);
    padding: 4px;
    /* Default inputs margin */
    margin: 0 8px;
  }
  /* wrapped for arc-marked */
  .docs {
    font-size: var(--arc-font-body1-font-size);
    font-weight: var(--arc-font-body1-font-weight);
    line-height: var(--arc-font-body1-line-height);
    color: var(--inline-documentation-color, rgba(0, 0, 0, 0.87));
    margin-right: 40px;
  }

  .markdown-body * {
    font-size: var(--inline-documentation-font-size, 13px) !important;
  }

  .markdown-body p:first-child {
    margin-top: 0;
    padding-top: 0;
  }

  .markdown-body p:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;
