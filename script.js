// @ts-check

class DepartmentManger {
  /**
   * @param {{ [department: string]: { [groupName: string]: { tags: string[], memberCount: number } } }} groups
   */
  constructor(groups) {
    this.groups = groups;

    this.setDepartments(Object.keys(groups));
    this.showGroups();

    window.addEventListener("hashchange", () => {
      this.showGroups();
    });
  }

  /**
   * Populate the department list with the given names
   * @param {string[]} departmentList
   */
  setDepartments(departmentList) {
    const template = /** @type {HTMLTemplateElement} */ (document.getElementById(
      "department-template"
    ));
    // Use DocumentFragment to optimize the loop
    const fragment = document.createDocumentFragment();

    for (const department of departmentList) {
      // Clone the template element
      const departmentElement = document.importNode(template.content, true);
      /** @type {HTMLAnchorElement} */
      const link = departmentElement.querySelector("a");
      link.textContent = department;
      // Make an ID based on the name, by replacing spaces with underscores
      link.href = "#" + department;

      fragment.appendChild(departmentElement);
    }

    const listElement = document.getElementById("departments");
    // Remove existing children
    while (listElement.firstChild) {
      listElement.removeChild(listElement.firstChild);
    }
    listElement.appendChild(fragment);

    // Select the first item in the list
    if (!location.hash) {
      location.hash = "#" + departmentList[0];
    }
  }

  /**
   * Populate the carosel with images from `images`.
   */
  showGroups() {
    const template = /** @type {HTMLTemplateElement} */ (document.getElementById(
      "group-template"
    ));
    const fragment = document.createDocumentFragment();

    // Get selected department from the current hash in the URL
    const selected = decodeURI(location.hash.slice(1));
    const groups = this.groups[selected];
    if (groups == null) {
      throw new Error("Invalid selected item " + selected);
    }

    for (const [name, { tags, memberCount }] of Object.entries(groups)) {
      // Clone the template element
      const groupElement = document.importNode(template.content, true);
      groupElement.querySelector(".group-name").textContent = name;
      groupElement.querySelector(".group-tags").textContent = tags.join(", ");
      groupElement.querySelector(
        ".group-member-count"
      ).textContent = memberCount.toString();

      groupElement
        .querySelector(".carousel-item")
        .addEventListener("click", event => {
          event.currentTarget.dispatchEvent(
            new CustomEvent("group_click", {
              bubbles: true,
              detail: {
                groupName: name,
                department: selected
              }
            })
          );
        });

      fragment.appendChild(groupElement);
    }

    const carousel = document.getElementById("carousel");

    while (carousel.firstChild) {
      carousel.removeChild(carousel.firstChild);
    }
    carousel.appendChild(fragment);
  }
}

/**
 *
 * @param {{ [department: string]: { [groupName: string]: { tags: string[], memberCount: number } } }} groups
 * @param {(event: CustomEvent<{ groupName: string, department: string }>) => void} onClick
 */
function buildWidget(groups, onClick) {
  new DepartmentManger(groups);
  document.addEventListener("group_click", onClick);
}

/**
 * Example usage
 */
buildWidget(
  {
    "T and O": {
      "Group A": { tags: ["#tag1", "#tag2"], memberCount: 10 },
      "Group B": { tags: ["#tag1", "#tag2"], memberCount: 20 }
    },
    "Capital Markets": {
      "Group C": { tags: ["#tag1", "#tag2"], memberCount: 30 }
    },
    Insurance: { "Group A": { tags: ["#tag1", "#tag2"], memberCount: 40 } },
    "Wealth Management": {
      "Group A": { tags: ["#tag1", "#tag2"], memberCount: 30 }
    }
  },
  event => console.log(event.detail.groupName, event.detail.department)
);
