import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./role.entity";
import { Menu } from "./menu.entity";

@Entity({
    name: 'role-data'
})
export class RoleData{

    @PrimaryGeneratedColumn()
    id: number;

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

    @ManyToOne(() => Role, role => role.roleData)
    role: Role;

    @ManyToOne(() => Menu, menu => menu.roleData)
    menu: Menu;

}