import { createElement } from "../../shared/utils/create-element";

type SortOrder = 'asc' | 'desc';

type SortableTableData = Record<string, string | number>;

interface SortableTableHeader {
  id: string;
  title: string;
  sortable?: boolean;
  sortType?: 'string' | 'number';
  template?: (value: string | number) => string;
}

export default class SortableTable {
  public element: HTMLElement;

  private body: HTMLElement | null;
  private header: HTMLElement | null;
  private headerConfig : SortableTableHeader[];
  private data : SortableTableData[];

  constructor(headersConfig: SortableTableHeader[] = [], data: SortableTableData[] = []) {
    this.headerConfig = headersConfig;
    this.data = data;
    this.element = createElement(`
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.getTableHeader()}
          </div>
          <div data-element="body" class="sortable-table__body">
            ${this.getTableBody()}
          </div>
        </div>
      </div>
    `);
    this.body = this.element.querySelector('[data-element="body"]');
    this.header = this.element.querySelector('[data-element="header"]');
  }

  public sort(field: string, order: SortOrder): void{
    if (!this.element) return;
    if (!this.body) return;   

    const headerItem = this.headerConfig.find(item => item.id === field);
    if (!headerItem) return; 
    if (!headerItem.sortable) return; 

    this.changeOrderAndArrowSort(field, order);

    const newArr = this.data.slice();

    const collator = new Intl.Collator(['ru', 'en'], {
      sensitivity: 'case',
      caseFirst: 'upper'
    });

    const direction = order === 'asc' ? 1 : -1;

    if (headerItem.sortType === 'string'){
      newArr.sort((a, b) => collator.compare(a[field] as string, b[field] as string) * direction);
    }
    else if (headerItem.sortType === 'number'){
      newArr.sort((a, b) => ((a[field] as number) - (b[field] as number)) * direction);
    }

    this.data = newArr;
    this.body.innerHTML = this.getTableBody()
  }

  private changeOrderAndArrowSort(field: string, order: SortOrder): void{
    const allHeaderCells = this.header?.querySelectorAll('.sortable-table__cell');
    allHeaderCells?.forEach(cell => {
      cell.removeAttribute('data-order');
    });

    const allArrows = this.header?.querySelectorAll('[data-element="arrow"]');
    allArrows?.forEach(arrow => arrow.remove());

    const headerCell = this.header?.querySelector(`[data-id="${field}"]`) as HTMLElement | null;
    if (headerCell) {
      headerCell.setAttribute('data-order', order);
      
      const arrowSpan = document.createElement('span');
      arrowSpan.setAttribute('data-element', 'arrow');
      arrowSpan.className = 'sortable-table__sort-arrow';
      arrowSpan.innerHTML = `<span class="sort-arrow ${order === 'asc' ? 'sort-arrow-asc' : 'sort-arrow-desc'}"></span>`;
      headerCell.appendChild(arrowSpan);        
    }
  }

  private getTableHeader(): string {
    return `
      ${this.headerConfig
        .map(item => {
          return `<div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
                    <span>${item.title}</span>
                  </div>`;
        })
        .join('')}
    `;
  }

  private getTableBody(): string {
    return `
      ${this.data
        .map(item => {
          return `<a href="${this.getProductLink(item)}" class="sortable-table__row">
                  ${this.getTableRaw(item)}
                 </a>`;
        })
        .join('')}
    `; 
  }

  private getProductLink(product: Record<string, any>): string {
    const parts = [];

    if (product?.subcategory?.category?.id) {
      parts.push(product.subcategory.category.id);
    }

    if (product?.subcategory?.id) {
      parts.push(product.subcategory.id);
    }

    if (product?.id) {
      parts.push(product.id);
    }

    return `/products/${parts.join('/')}`;
  }

  private getTableRaw(product: SortableTableData): string {
    return this.headerConfig
      .map(item => {
        const value = product[item.id];
        return item.template
          ? item.template(value)
          : `<div class="sortable-table__cell">${value}</div>`;
      })
      .join('');
  }

  public remove(){
    if (this.element){
      this.element.remove();
    }
  }

  public destroy(){
    this.remove();
  }
}
