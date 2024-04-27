import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RoleData } from "./role-data.entity";

@Entity({
    name: 'menu'
})
export class Menu{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        comment: '菜单名称',
        name: 'menu_name'
    })
    menuName: string;

    @Column({
        comment: '菜单父ID',
        default: 0
    })
    pid: number;

    @Column({
        comment: '菜单路径',
        name: 'menu_path'
    })
    menuPath: string;

    @Column({
        comment: '菜单组件，指向的文件名称',
        name: 'menu_component',
        nullable: true
    })
    menuComponent: string;

    @Column({
        comment: '菜单图标',
        name: 'menu_icon',
        nullable: true
    })
    menuIcon: string;
    
    @Column({
        comment: '菜单排序',
        default: 0
    })
    sort: number;

    @Column({
        name: 'is_delete',
        comment: '逻辑删除0是正常状态，1是删除',
        default: 0
    })
    isDelete: number;

    @CreateDateColumn({
        name: 'create_time'
    })
    createTime: Date;

    @CreateDateColumn({
        name: 'update_time'
    })
    updateTime: Date;

    @OneToMany(() => RoleData, roleData => roleData.menu)
    roleData: RoleData[];
}