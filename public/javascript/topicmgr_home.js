function approveBlog(id,value) {
    $.ajax({
        url: '/admin/approveBlog',
        method: 'post',
        data: {
            id: id,
            value: value
        },
        success: (response)=> {
            if(response === "1") {
                location.reload()
            }else if(response === "0"){
                location.reload()
            }else if(response === "2") {
                location.reload()
            }
        }
    })
}