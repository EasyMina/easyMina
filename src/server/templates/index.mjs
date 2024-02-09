const frontend = `
# Frontend

**ProjectName**: {{projectName}}

**Available Examples**

{{frontend}}

`

const overview = `
{{projects}}

<details open>
<summary>
<h2>Credentials</h2>
</summary>  

<details open>
<summary>
<h3>Accounts</h3>
</summary>  
  
{{accountTables}}  
</details>

<details open>
<summary>
<h3>Contracts</h3>
</summary>  
  
{{deployedContracts}}  
</details>

</details>



`

export { frontend, overview }